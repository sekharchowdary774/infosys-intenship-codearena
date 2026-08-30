package com.codingplatform.coding_platform.execution.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.codingplatform.coding_platform.execution.dto.ExecutionResult;
import com.codingplatform.coding_platform.submission.entity.ProgrammingLanguage;

import org.springframework.stereotype.Service;

@Service
public class DockerExecutionService
        implements CodeExecutionService {

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


    // =========================================================
    // JAVA
    // =========================================================

    private ExecutionResult executeJava(
            String sourceCode,
            String input,
            Integer timeLimitMs) {

        Path tempDirectory = null;

        try {

            tempDirectory =
                    Files.createTempDirectory(
                            "coding-platform-"
                    );

            /*
             * The user's Solution class is combined with
             * a generated Main judge class.
             */
            String mainCode =
                    buildMainClass(
                            sourceCode,
                            input
                    );

            Path sourceFile =
                    tempDirectory.resolve("Main.java");

            Files.writeString(
                    sourceFile,
                    mainCode,
                    StandardCharsets.UTF_8
            );


            // Compile
            ExecutionResult compilationResult =
                    compileJava(tempDirectory);

            if (compilationResult.isCompilationError()) {
                return compilationResult;
            }


            // Execute
            return runJava(
                    tempDirectory,
                    timeLimitMs
            );

        } catch (Exception exception) {

            ExecutionResult result =
                    new ExecutionResult();

            result.setRuntimeError(true);
            result.setTimedOut(false);
            result.setError(
                    exception.getMessage()
            );

            return result;

        } finally {

            deleteDirectory(tempDirectory);
        }
    }


    // =========================================================
    // BUILD JUDGE
    // =========================================================

    private String buildMainClass(
            String sourceCode,
            String input) {

        if (sourceCode == null ||
                sourceCode.isBlank()) {

            throw new RuntimeException(
                    "Source code cannot be empty"
            );
        }

        if (input == null ||
                input.isBlank()) {

            throw new RuntimeException(
                    "Test case input cannot be empty"
            );
        }


        /*
         * We currently support the platform's
         * Two Sum input format:
         *
         * nums = [3,2,4], target = 6
         */


        String normalizedInput =
                input.trim();


        int numsStart =
                normalizedInput.indexOf("[");

        int numsEnd =
                normalizedInput.indexOf("]");


        if (numsStart < 0 ||
                numsEnd < 0 ||
                numsEnd <= numsStart) {

            throw new RuntimeException(
                    "Invalid input format. " +
                            "Expected: nums = [3,2,4], target = 6"
            );
        }


        String nums =
                normalizedInput.substring(
                        numsStart + 1,
                        numsEnd
                ).trim();


        int targetIndex =
                normalizedInput.indexOf(
                        "target",
                        numsEnd
                );


        if (targetIndex < 0) {

            throw new RuntimeException(
                    "Target not found in input"
            );
        }


        int equalsIndex =
                normalizedInput.indexOf(
                        "=",
                        targetIndex
                );


        if (equalsIndex < 0) {

            throw new RuntimeException(
                    "Invalid target format"
            );
        }


        String target =
                normalizedInput
                        .substring(
                                equalsIndex + 1
                        )
                        .trim();


        String numsExpression;

        if (nums.isBlank()) {

            numsExpression =
                    "new int[]{}";

        } else {

            numsExpression =
                    "new int[]{" +
                            nums +
                            "}";
        }


        /*
         * Make Solution package-private if the user
         * writes "public class Solution".
         */
        String userCode =
                sourceCode.trim()
                        .replaceFirst(
                                "\\bpublic\\s+class\\s+Solution\\b",
                                "class Solution"
                        );


        return """
                import java.util.*;
                
                %s
                
                public class Main {
                
                    public static void main(String[] args) {
                
                        int[] nums = %s;
                
                        int target = %s;
                
                        Solution solution = new Solution();
                
                        int[] result =
                                solution.twoSum(nums, target);
                
                        System.out.println(
                                Arrays.toString(result)
                        );
                    }
                }
                """.formatted(
                userCode,
                numsExpression,
                target
        );
    }


    // =========================================================
    // COMPILE
    // =========================================================

    private ExecutionResult compileJava(
            Path tempDirectory)
            throws IOException, InterruptedException {

        ExecutionResult result =
                new ExecutionResult();


        List<String> command = List.of(

                "docker",
                "run",
                "--rm",

                "--network",
                "none",

                "--memory",
                "512m",

                "--cpus",
                "1",

                "-v",
                tempDirectory
                        .toAbsolutePath()
                        .toString()
                        + ":/app",

                "-w",
                "/app",

                "eclipse-temurin:17",

                "javac",

                "Main.java"
        );


        ProcessBuilder processBuilder =
                new ProcessBuilder(command);

        processBuilder.redirectErrorStream(true);


        Process process =
                processBuilder.start();


        String output =
                new String(
                        process.getInputStream()
                                .readAllBytes(),
                        StandardCharsets.UTF_8
                );


        int exitCode =
                process.waitFor();


        if (exitCode != 0) {

            result.setCompilationError(true);
            result.setRuntimeError(false);
            result.setTimedOut(false);

            result.setError(output);

            return result;
        }


        result.setCompilationError(false);
        result.setRuntimeError(false);
        result.setTimedOut(false);

        return result;
    }


    // =========================================================
    // RUN
    // =========================================================

    private ExecutionResult runJava(
            Path tempDirectory,
            Integer timeLimitMs)
            throws IOException, InterruptedException {

        ExecutionResult result =
                new ExecutionResult();


        int effectiveTimeLimit =
                timeLimitMs != null &&
                        timeLimitMs > 0
                        ? timeLimitMs
                        : 5000;


        List<String> command = List.of(

                "docker",
                "run",
                "--rm",

                "--network",
                "none",

                "--memory",
                "512m",

                "--cpus",
                "1",

                "-v",
                tempDirectory
                        .toAbsolutePath()
                        .toString()
                        + ":/app",

                "-w",
                "/app",

                "eclipse-temurin:17",

                "java",

                "Main"
        );


        ProcessBuilder processBuilder =
                new ProcessBuilder(command);

        processBuilder.redirectErrorStream(true);


        Process process =
                processBuilder.start();


        Instant start =
                Instant.now();


        boolean completed =
                process.waitFor(
                        effectiveTimeLimit,
                        TimeUnit.MILLISECONDS
                );


        long executionTime =
                Duration.between(
                        start,
                        Instant.now()
                ).toMillis();


        result.setExecutionTimeMs(
                executionTime
        );


        // -----------------------------------------------------
        // TIME LIMIT
        // -----------------------------------------------------

        if (!completed) {

            process.destroyForcibly();

            result.setTimedOut(true);
            result.setRuntimeError(false);

            result.setError(
                    "Time limit exceeded"
            );

            return result;
        }


        // -----------------------------------------------------
        // OUTPUT
        // -----------------------------------------------------

        String output =
                new String(
                        process.getInputStream()
                                .readAllBytes(),
                        StandardCharsets.UTF_8
                );


        int exitCode =
                process.exitValue();


        // -----------------------------------------------------
        // RUNTIME ERROR
        // -----------------------------------------------------

        if (exitCode != 0) {

            result.setRuntimeError(true);
            result.setTimedOut(false);

            result.setError(
                    output
            );

            return result;
        }


        // -----------------------------------------------------
        // SUCCESS
        // -----------------------------------------------------

        result.setRuntimeError(false);
        result.setTimedOut(false);

        result.setOutput(
                output.trim()
        );

        return result;
    }


    // =========================================================
    // CLEANUP
    // =========================================================

    private void deleteDirectory(
            Path directory) {

        if (directory == null) {
            return;
        }

        try {

            if (!Files.exists(directory)) {
                return;
            }

            Files.walk(directory)
                    .sorted(
                            (path1, path2) ->
                                    path2.compareTo(path1)
                    )
                    .forEach(path -> {

                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                        }

                    });

        } catch (IOException ignored) {
        }
    }
}