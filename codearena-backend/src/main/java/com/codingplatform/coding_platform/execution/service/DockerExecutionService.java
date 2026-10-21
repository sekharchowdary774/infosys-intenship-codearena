package com.codingplatform.coding_platform.execution.service;

import jakarta.annotation.PostConstruct;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.codingplatform.coding_platform.execution.dto.ExecutionResult;
import com.codingplatform.coding_platform.submission.entity.ProgrammingLanguage;


@Service
public class DockerExecutionService implements CodeExecutionService {

    private static final Logger log =
            LoggerFactory.getLogger(DockerExecutionService.class);

    private static final String JAVA_IMAGE = "eclipse-temurin:17";


    // -----------------------------------------------------------------
    // WHY A WARM CONTAINER POOL:
    //
    // Measured directly (manual `docker run` timing, no host bind-mount
    // involved at all, using a Docker volume): compiling one trivial file
    // still took several seconds, running it also took several seconds.
    //
    // The bottleneck is the cost of creating a brand-new Docker container
    // every single time:
    //
    // new network namespace
    // new overlay filesystem layer
    // cgroup setup
    // JVM startup
    //
    // The fix: keep a small number of containers running continuously
    // and use `docker exec` to run submissions inside them.
    //
    // With POOL_SIZE containers and the queue below handing out one
    // container per in-flight submission, only one submission runs inside
    // a worker at a time.
    // -----------------------------------------------------------------

    private static final int POOL_SIZE = 3;


    private final ExecutorService streamReaderPool =
            Executors.newCachedThreadPool();

    private final BlockingQueue<String> availableContainers =
            new LinkedBlockingQueue<>();


    // -----------------------------------------------------------------
    // START WORKER CONTAINER POOL
    // -----------------------------------------------------------------

    @PostConstruct
    public void startContainerPool() {

        for (int i = 0; i < POOL_SIZE; i++) {

            String name = "codearena-worker-" + i;

            // -----------------------------------------------------------
            // IDEMPOTENT STARTUP:
            //
            // Spring Boot DevTools can restart the application context
            // without killing the JVM.
            //
            // Therefore, if the worker container is already running,
            // reuse it instead of removing and recreating it.
            // -----------------------------------------------------------

            if (isContainerRunning(name)) {

                availableContainers.add(name);

                log.info(
                        "Reusing already-running worker container: {}",
                        name
                );

                continue;
            }


            try {

                // Clean up a leftover stopped/crashed container.
                runQuickCommand(
                        List.of(
                                "docker",
                                "rm",
                                "-f",
                                name
                        ),
                        "cleanup old worker"
                );

            } catch (Exception ignored) {
                // Fine if the container didn't exist.
            }


            // -----------------------------------------------------------
            // Start worker.
            //
            // Two attempts are allowed because Docker Desktop can
            // occasionally have a transient startup delay.
            // -----------------------------------------------------------

            boolean started = false;

            for (
                    int attempt = 1;
                    attempt <= 2 && !started;
                    attempt++
            ) {

                try {

                    runQuickCommand(
                            List.of(
                                    "docker",
                                    "run",
                                    "-d",
                                    "--name",
                                    name,
                                    "--network",
                                    "none",
                                    "--memory",
                                    "512m",
                                    "--cpus",
                                    "1",
                                    JAVA_IMAGE,
                                    "sleep",
                                    "infinity"
                            ),
                            "start worker container " + name,
                            60
                    );


                    availableContainers.add(name);

                    log.info(
                            "Started warm worker container: {}",
                            name
                    );

                    started = true;


                } catch (Exception e) {

                    if (attempt == 2) {

                        log.error(
                                "Failed to start worker container {} after {} attempts — it won't be available for executions",
                                name,
                                attempt,
                                e
                        );

                    } else {

                        log.warn(
                                "Attempt {} to start worker container {} failed, retrying once: {}",
                                attempt,
                                name,
                                e.getMessage()
                        );
                    }
                }
            }
        }


        if (availableContainers.isEmpty()) {

            log.error(
                    "No worker containers started successfully. All code execution requests will fail until this is fixed."
            );
        }


        // -----------------------------------------------------------
        // REAL JVM SHUTDOWN HOOK
        //
        // We intentionally don't use @PreDestroy because DevTools
        // hot reload can trigger Spring context destruction without
        // the JVM actually shutting down.
        // -----------------------------------------------------------

        Runtime.getRuntime().addShutdownHook(
                new Thread(this::stopContainerPool)
        );
    }


    // -----------------------------------------------------------------
    // STOP WORKER CONTAINER POOL
    // -----------------------------------------------------------------

    public void stopContainerPool() {

        for (int i = 0; i < POOL_SIZE; i++) {

            String name = "codearena-worker-" + i;

            try {

                runQuickCommand(
                        List.of(
                                "docker",
                                "rm",
                                "-f",
                                name
                        ),
                        "stop worker container " + name,
                        30
                );

            } catch (Exception ignored) {
                // Best effort cleanup.
            }
        }
    }


    // -----------------------------------------------------------------
    // CHECK WHETHER CONTAINER IS RUNNING
    // -----------------------------------------------------------------

    private boolean isContainerRunning(String name) {

        try {

            ProcessBuilder processBuilder =
                    new ProcessBuilder(
                            "docker",
                            "inspect",
                            "-f",
                            "{{.State.Running}}",
                            name
                    );

            processBuilder.redirectErrorStream(true);

            Process process =
                    processBuilder.start();


            Future<String> outputFuture =
                    streamReaderPool.submit(
                            () -> readAll(
                                    process.getInputStream()
                            )
                    );


            boolean completed =
                    process.waitFor(
                            8,
                            TimeUnit.SECONDS
                    );


            if (!completed) {

                process.destroyForcibly();

                outputFuture.cancel(true);

                return false;
            }


            if (process.exitValue() != 0) {

                return false;
            }


            String output =
                    outputFuture
                            .get(
                                    2,
                                    TimeUnit.SECONDS
                            )
                            .trim();


            return "true".equals(output);


        } catch (Exception e) {

            return false;
        }
    }


    // -----------------------------------------------------------------
    // PUBLIC EXECUTION METHOD
    // -----------------------------------------------------------------

    @Override
    public ExecutionResult execute(
            String sourceCode,
            String input,
            ProgrammingLanguage language,
            Integer timeLimitMs) {

        if (language != ProgrammingLanguage.JAVA) {

            throw new RuntimeException(
                    "Currently only JAVA execution is implemented"
            );
        }


        return executeJava(
                sourceCode,
                input,
                timeLimitMs
        );
    }


    // -----------------------------------------------------------------
    // JAVA EXECUTION
    // -----------------------------------------------------------------

    private ExecutionResult executeJava(
            String sourceCode,
            String input,
            Integer timeLimitMs) {

        String containerName = null;

        Path tempDirectory = null;

        String workId =
                UUID.randomUUID().toString();

        String workDir =
                "/work/" + workId;


        try {

            // -----------------------------------------------------------
            // GET FREE WORKER
            //
            // If all workers are busy, wait up to 15 seconds.
            // -----------------------------------------------------------

            containerName =
                    availableContainers.poll(
                            15,
                            TimeUnit.SECONDS
                    );


            if (containerName == null) {

                ExecutionResult result =
                        new ExecutionResult();

                result.setRuntimeError(true);

                result.setError(
                        "All execution workers are busy right now. Please try again in a moment."
                );

                return result;
            }


            // -----------------------------------------------------------
            // CREATE TEMP SOURCE FILE
            // -----------------------------------------------------------

            tempDirectory =
                    Files.createTempDirectory(
                            "coding-platform-"
                    );


            Path sourceFile =
                    tempDirectory.resolve(
                            "Main.java"
                    );


            Files.writeString(
                    sourceFile,
                    sourceCode,
                    StandardCharsets.UTF_8
            );


            // -----------------------------------------------------------
            // CREATE WORK DIRECTORY INSIDE CONTAINER
            // -----------------------------------------------------------

            runQuickCommandWithRetry(
                    List.of(
                            "docker",
                            "exec",
                            containerName,
                            "mkdir",
                            "-p",
                            workDir
                    ),
                    "create work dir"
            );


            // -----------------------------------------------------------
            // COPY SOURCE CODE INTO CONTAINER
            // -----------------------------------------------------------

            runQuickCommandWithRetry(
                    List.of(
                            "docker",
                            "cp",
                            sourceFile
                                    .toAbsolutePath()
                                    .toString(),
                            containerName
                                    + ":"
                                    + workDir
                                    + "/Main.java"
                    ),
                    "copy source into worker container"
            );


            // ===========================================================
            // STEP 1: COMPILE CODE
            // ===========================================================

            Instant compileStart =
                    Instant.now();


            ExecutionResult compilationResult =
                    compileJava(
                            containerName,
                            workDir
                    );


            log.info(
                    "Compile step took {} ms",
                    Duration
                            .between(
                                    compileStart,
                                    Instant.now()
                            )
                            .toMillis()
            );


            if (compilationResult.isCompilationError()) {

                return compilationResult;
            }


            // ===========================================================
            // STEP 2: RUN CODE
            // ===========================================================

            Instant runStart =
                    Instant.now();


            ExecutionResult runResult =
                    runJava(
                            containerName,
                            workDir,
                            input,
                            timeLimitMs
                    );


            log.info(
                    "Run step took {} ms",
                    Duration
                            .between(
                                    runStart,
                                    Instant.now()
                            )
                            .toMillis()
            );


            return runResult;


        } catch (Exception exception) {

            log.error(
                    "Execution failed",
                    exception
            );


            ExecutionResult result =
                    new ExecutionResult();

            result.setRuntimeError(true);

            result.setError(
                    exception.getMessage()
            );


            return result;


        } finally {

            // -----------------------------------------------------------
            // DELETE HOST TEMP DIRECTORY
            // -----------------------------------------------------------

            deleteDirectory(
                    tempDirectory
            );


            // -----------------------------------------------------------
            // DELETE WORKSPACE INSIDE WORKER
            // -----------------------------------------------------------

            if (containerName != null) {

                try {

                    runQuickCommand(
                            List.of(
                                    "docker",
                                    "exec",
                                    containerName,
                                    "rm",
                                    "-rf",
                                    workDir
                            ),
                            "cleanup work dir"
                    );

                } catch (Exception ignored) {
                    // Best effort cleanup.
                }


                // Return worker to pool.
                availableContainers.add(
                        containerName
                );
            }
        }
    }


    // =========================================================
    // COMPILE
    // =========================================================

    private ExecutionResult compileJava(
            String containerName,
            String workDir)
            throws IOException, InterruptedException {

        ExecutionResult result =
                new ExecutionResult();


        List<String> command =
                List.of(
                        "docker",
                        "exec",
                        "-w",
                        workDir,
                        containerName,
                        "javac",
                        "Main.java"
                );


        ProcessBuilder processBuilder =
                new ProcessBuilder(command);

        processBuilder.redirectErrorStream(true);


        Process process =
                processBuilder.start();


        Future<String> outputFuture =
                streamReaderPool.submit(
                        () -> readAll(
                                process.getInputStream()
                        )
                );


        // -----------------------------------------------------------
        // Compilation gets 30 seconds.
        //
        // This is intentionally separate from the problem's runtime
        // time limit. Compilation is infrastructure/JVM work and should
        // not cause a normal solution to become TLE.
        // -----------------------------------------------------------

        boolean completed =
                process.waitFor(
                        30,
                        TimeUnit.SECONDS
                );


        if (!completed) {

            process.destroyForcibly();

            outputFuture.cancel(true);

            result.setRuntimeError(true);

            result.setError(
                    "Compilation did not finish in time."
            );

            return result;
        }


        int exitCode =
                process.exitValue();


        String output;

        try {

            output =
                    outputFuture.get(
                            2,
                            TimeUnit.SECONDS
                    );

        } catch (Exception e) {

            output = "";
        }


        // -----------------------------------------------------------
        // COMPILATION ERROR
        // -----------------------------------------------------------

        if (exitCode != 0) {

            result.setCompilationError(true);

            result.setError(output);

            return result;
        }


        result.setCompilationError(false);

        return result;
    }


    // =========================================================
    // RUN JAVA
    // =========================================================

    private ExecutionResult runJava(
            String containerName,
            String workDir,
            String input,
            Integer timeLimitMs)
            throws IOException, InterruptedException {

        ExecutionResult result =
                new ExecutionResult();


        // -----------------------------------------------------------
        // USE THE PROBLEM'S TIME LIMIT.
        //
        // If no valid limit is supplied, default to 10 seconds.
        //
        // IMPORTANT:
        // Keep this in milliseconds internally so we don't lose
        // fractional seconds by integer division.
        // -----------------------------------------------------------

        int effectiveLimitMs =
                (
                        timeLimitMs != null
                                && timeLimitMs > 0
                )
                        ? timeLimitMs
                        : 10000;


        // Convert milliseconds to seconds while preserving fractions.
        //
        // Examples:
        //
        // 1000 ms  -> 1.000s
        // 1500 ms  -> 1.500s
        // 2500 ms  -> 2.500s
        // 10000 ms -> 10.000s
        //
        String timeoutValue =
                String.format(
                        Locale.US,
                        "%.3fs",
                        effectiveLimitMs / 1000.0
                );


        // -----------------------------------------------------------
        // RUN JAVA INSIDE THE ALREADY-RUNNING WORKER.
        //
        // `timeout` runs INSIDE the container.
        //
        // This is important because simply killing the local
        // `docker exec` process does NOT necessarily kill the Java
        // process running inside our long-lived worker container.
        // -----------------------------------------------------------

        List<String> command =
                List.of(
                        "docker",
                        "exec",
                        "-i",
                        "-w",
                        workDir,
                        containerName,
                        "timeout",
                        "--signal=KILL",
                        timeoutValue,
                        "java",
                        "Main"
                );


        ProcessBuilder processBuilder =
                new ProcessBuilder(command);


        // Keep stdout and stderr separate so runtime errors can be
        // reported correctly.

        processBuilder.redirectErrorStream(false);


        Process process =
                processBuilder.start();


        // -----------------------------------------------------------
        // SEND TESTCASE INPUT
        // -----------------------------------------------------------

        if (input != null && !input.isEmpty()) {

            try (
                    OutputStream os =
                            process.getOutputStream()
            ) {

                os.write(
                        input.getBytes(
                                StandardCharsets.UTF_8
                        )
                );

                os.flush();
            }

        } else {

            process.getOutputStream().close();
        }


        // -----------------------------------------------------------
        // READ STDOUT AND STDERR CONCURRENTLY.
        //
        // This prevents pipe-buffer deadlocks when a program produces
        // a lot of output.
        // -----------------------------------------------------------

        Future<String> stdoutFuture =
                streamReaderPool.submit(
                        () -> readAll(
                                process.getInputStream()
                        )
                );


        Future<String> stderrFuture =
                streamReaderPool.submit(
                        () -> readAll(
                                process.getErrorStream()
                        )
                );


        // -----------------------------------------------------------
        // LOCAL SAFETY-NET TIMEOUT
        //
        // The actual Java process is controlled by the `timeout`
        // command inside Docker.
        //
        // We give the outer docker exec process an additional
        // 3 seconds to receive the exit signal and finish.
        // -----------------------------------------------------------

        long localWaitMs =
                effectiveLimitMs + 3000L;


        Instant start =
                Instant.now();


        boolean finished =
                process.waitFor(
                        localWaitMs,
                        TimeUnit.MILLISECONDS
                );


        Instant finish =
                Instant.now();


        long executionTime =
                Duration
                        .between(
                                start,
                                finish
                        )
                        .toMillis();


        result.setExecutionTimeMs(
                executionTime
        );


        // -----------------------------------------------------------
        // LOCAL SAFETY-NET TIMEOUT
        // -----------------------------------------------------------

        if (!finished) {

            process.destroyForcibly();

            stdoutFuture.cancel(true);

            stderrFuture.cancel(true);

            result.setTimedOut(true);

            result.setError(
                    "Time Limit Exceeded"
            );

            return result;
        }


        // -----------------------------------------------------------
        // COLLECT STDOUT
        // -----------------------------------------------------------

        String stdout;

        try {

            stdout =
                    stdoutFuture.get(
                            2,
                            TimeUnit.SECONDS
                    );

        } catch (Exception e) {

            stdout = "";
        }


        // -----------------------------------------------------------
        // COLLECT STDERR
        // -----------------------------------------------------------

        String stderr;

        try {

            stderr =
                    stderrFuture.get(
                            2,
                            TimeUnit.SECONDS
                    );

        } catch (Exception e) {

            stderr = "";
        }


        int exitCode =
                process.exitValue();


        // -----------------------------------------------------------
        // GNU `timeout` RETURNS 137 WHEN IT KILLS JAVA.
        //
        // Therefore 137 means genuine TLE.
        // -----------------------------------------------------------

        if (exitCode == 137) {

            result.setTimedOut(true);

            result.setError(
                    "Time Limit Exceeded"
            );

            return result;
        }


        // -----------------------------------------------------------
        // OTHER NON-ZERO EXIT CODE = RUNTIME ERROR
        // -----------------------------------------------------------

        if (exitCode != 0) {

            result.setRuntimeError(true);

            result.setError(
                    !stderr.isBlank()
                            ? stderr
                            : stdout
            );

            return result;
        }


        // -----------------------------------------------------------
        // SUCCESS
        // -----------------------------------------------------------

        result.setOutput(stdout);

        return result;
    }


    // =========================================================
    // QUICK DOCKER COMMAND
    // =========================================================

    private void runQuickCommand(
            List<String> command,
            String description)
            throws IOException, InterruptedException {

        runQuickCommand(
                command,
                description,
                20
        );
    }


    // =========================================================
    // QUICK DOCKER COMMAND WITH RETRY
    // =========================================================

    private void runQuickCommandWithRetry(
            List<String> command,
            String description)
            throws IOException, InterruptedException {

        try {

            runQuickCommand(
                    command,
                    description
            );

        } catch (IOException firstFailure) {

            log.warn(
                    "'{}' failed, retrying once: {}",
                    description,
                    firstFailure.getMessage()
            );


            runQuickCommand(
                    command,
                    description
            );
        }
    }


    // =========================================================
    // QUICK DOCKER COMMAND WITH CUSTOM TIMEOUT
    // =========================================================

    private void runQuickCommand(
            List<String> command,
            String description,
            int timeoutSeconds)
            throws IOException, InterruptedException {

        ProcessBuilder processBuilder =
                new ProcessBuilder(command);

        processBuilder.redirectErrorStream(true);


        Process process =
                processBuilder.start();


        Future<String> outputFuture =
                streamReaderPool.submit(
                        () -> readAll(
                                process.getInputStream()
                        )
                );


        boolean completed =
                process.waitFor(
                        timeoutSeconds,
                        TimeUnit.SECONDS
                );


        if (!completed) {

            process.destroyForcibly();

            outputFuture.cancel(true);

            throw new IOException(
                    "Docker command timed out: "
                            + description
            );
        }


        int exitCode =
                process.exitValue();


        if (exitCode != 0) {

            String output;

            try {

                output =
                        outputFuture.get(
                                2,
                                TimeUnit.SECONDS
                        );

            } catch (Exception e) {

                output = "";
            }


            throw new IOException(
                    "Docker command failed ("
                            + description
                            + "): "
                            + output
            );
        }
    }


    // =========================================================
    // READ PROCESS OUTPUT
    // =========================================================

    private String readAll(
            InputStream inputStream) {

        try {

            ByteArrayOutputStream buffer =
                    new ByteArrayOutputStream();


            byte[] chunk =
                    new byte[4096];


            int bytesRead;


            while (
                    (bytesRead =
                            inputStream.read(chunk))
                            != -1
            ) {

                buffer.write(
                        chunk,
                        0,
                        bytesRead
                );
            }


            return buffer.toString(
                    StandardCharsets.UTF_8
            );


        } catch (IOException e) {

            return "";
        }
    }


    // =========================================================
    // DELETE TEMP DIRECTORY
    // =========================================================

    private void deleteDirectory(
            Path path) {

        if (path == null) {
            return;
        }


        try {

            if (!Files.exists(path)) {
                return;
            }


            Files.walk(path)
                    .sorted(
                            (a, b) ->
                                    b.compareTo(a)
                    )
                    .forEach(
                            p -> {

                                try {

                                    Files.deleteIfExists(p);

                                } catch (IOException ignored) {
                                }
                            }
                    );


        } catch (IOException ignored) {
        }
    }
}