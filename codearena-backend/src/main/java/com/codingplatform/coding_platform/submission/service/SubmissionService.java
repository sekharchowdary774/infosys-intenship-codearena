package com.codingplatform.coding_platform.submission.service;

import java.util.List;

import com.codingplatform.coding_platform.execution.dto.ExecutionResult;
import com.codingplatform.coding_platform.execution.service.CodeExecutionService;
import com.codingplatform.coding_platform.execution.util.OutputComparator;

import com.codingplatform.coding_platform.problem.entity.Problem;
import com.codingplatform.coding_platform.problem.repository.ProblemRepository;

import com.codingplatform.coding_platform.submission.dto.RunRequest;
import com.codingplatform.coding_platform.submission.dto.SubmissionRequest;
import com.codingplatform.coding_platform.submission.dto.SubmissionResponse;
import com.codingplatform.coding_platform.submission.entity.Submission;
import com.codingplatform.coding_platform.submission.entity.SubmissionStatus;
import com.codingplatform.coding_platform.submission.repository.SubmissionRepository;

import com.codingplatform.coding_platform.submissionresult.entity.TestCaseStatus;
import com.codingplatform.coding_platform.submissionresult.service.SubmissionResultService;

import com.codingplatform.coding_platform.testcase.entity.TestCase;
import com.codingplatform.coding_platform.testcase.repository.TestCaseRepository;

import com.codingplatform.coding_platform.users.entity.User;
import com.codingplatform.coding_platform.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;

    private final UserRepository userRepository;

    private final ProblemRepository problemRepository;

    private final TestCaseRepository testCaseRepository;

    private final CodeExecutionService codeExecutionService;

    private final SubmissionResultService submissionResultService;


    // =========================================================
    // CREATE NEW SUBMISSION
    // =========================================================

    public SubmissionResponse createSubmission(
            SubmissionRequest request) {

        User user = getCurrentUser();


        // -----------------------------------------------------
        // Find problem
        // -----------------------------------------------------

        Problem problem =
                problemRepository.findById(
                        request.getProblemId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Problem not found with id: "
                                        + request.getProblemId()
                        )
                );


        // -----------------------------------------------------
        // Create submission
        // -----------------------------------------------------

        Submission submission =
                new Submission();

        submission.setUser(user);

        submission.setProblem(problem);

        submission.setLanguage(
                request.getLanguage()
        );

        submission.setSourceCode(
                request.getSourceCode()
        );

        submission.setStatus(
                SubmissionStatus.PENDING
        );


        // -----------------------------------------------------
        // Save initial submission
        // -----------------------------------------------------

        Submission savedSubmission =
                submissionRepository.save(
                        submission
                );


        // -----------------------------------------------------
        // Evaluate submission
        // -----------------------------------------------------

        evaluateSubmission(
                savedSubmission
        );


        // -----------------------------------------------------
        // Save final result
        // -----------------------------------------------------

        savedSubmission =
                submissionRepository.save(
                        savedSubmission
                );


        return convertToResponse(
                savedSubmission
        );
    }


    // =========================================================
    // EVALUATE SUBMISSION
    // =========================================================

    private void evaluateSubmission(
            Submission submission) {

        try {

            submission.setStatus(
                    SubmissionStatus.RUNNING
            );


            // -------------------------------------------------
            // Get all test cases
            // -------------------------------------------------

            List<TestCase> testCases =
                    testCaseRepository.findByProblemId(
                            submission
                                    .getProblem()
                                    .getId()
                    );


            if (testCases == null ||
                    testCases.isEmpty()) {

                submission.setStatus(
                        SubmissionStatus.WRONG_ANSWER
                );

                submission.setErrorMessage(
                        "No test cases available for this problem"
                );

                return;
            }


            // -------------------------------------------------
            // Execute every test case
            // -------------------------------------------------

            for (TestCase testCase : testCases) {

                ExecutionResult result =
                        codeExecutionService.execute(

                                submission.getSourceCode(),

                                testCase.getInput(),

                                submission.getLanguage(),

                                testCase.getTimeLimitMs()
                        );


                // =============================================
                // Compilation error
                // =============================================

                if (result.isCompilationError()) {

                    submissionResultService.saveResult(

                            submission,

                            testCase,

                            TestCaseStatus.FAILED,

                            result.getOutput(),

                            result.getExecutionTimeMs(),

                            result.getMemoryUsedKb(),

                            result.getError()
                    );


                    submission.setStatus(
                            SubmissionStatus.COMPILATION_ERROR
                    );

                    submission.setErrorMessage(
                            result.getError()
                    );

                    submission.setExecutionTimeMs(
                            result.getExecutionTimeMs()
                    );

                    submission.setMemoryUsedKb(
                            result.getMemoryUsedKb()
                    );

                    return;
                }


                // =============================================
                // Time limit exceeded
                // =============================================

                if (result.isTimedOut()) {

                    submissionResultService.saveResult(

                            submission,

                            testCase,

                            TestCaseStatus.TIME_LIMIT_EXCEEDED,

                            result.getOutput(),

                            result.getExecutionTimeMs(),

                            result.getMemoryUsedKb(),

                            result.getError()
                    );


                    submission.setStatus(
                            SubmissionStatus.TIME_LIMIT_EXCEEDED
                    );

                    submission.setErrorMessage(
                            result.getError()
                    );

                    submission.setExecutionTimeMs(
                            result.getExecutionTimeMs()
                    );

                    submission.setMemoryUsedKb(
                            result.getMemoryUsedKb()
                    );

                    return;
                }


                // =============================================
                // Memory limit exceeded
                // =============================================

                /*
                 * Your current DockerExecutionService does not
                 * explicitly detect memory-limit failures yet.
                 *
                 * This branch is included so the evaluator is
                 * ready when memory-limit detection is added.
                 */

                if (result.getMemoryUsedKb() != null &&
                        testCase.getTimeLimitMs() != null &&
                        result.getMemoryUsedKb() <= 0) {

                    submissionResultService.saveResult(

                            submission,

                            testCase,

                            TestCaseStatus.MEMORY_LIMIT_EXCEEDED,

                            result.getOutput(),

                            result.getExecutionTimeMs(),

                            result.getMemoryUsedKb(),

                            result.getError()
                    );


                    submission.setStatus(
                            SubmissionStatus.MEMORY_LIMIT_EXCEEDED
                    );

                    submission.setErrorMessage(
                            "Memory limit exceeded"
                    );

                    return;
                }


                // =============================================
                // Runtime error
                // =============================================

                if (result.isRuntimeError()) {

                    submissionResultService.saveResult(

                            submission,

                            testCase,

                            TestCaseStatus.RUNTIME_ERROR,

                            result.getOutput(),

                            result.getExecutionTimeMs(),

                            result.getMemoryUsedKb(),

                            result.getError()
                    );


                    submission.setStatus(
                            SubmissionStatus.RUNTIME_ERROR
                    );

                    submission.setErrorMessage(
                            result.getError()
                    );

                    submission.setExecutionTimeMs(
                            result.getExecutionTimeMs()
                    );

                    submission.setMemoryUsedKb(
                            result.getMemoryUsedKb()
                    );

                    return;
                }


                // =============================================
                // Compare output
                // =============================================

                boolean outputMatches =
                        OutputComparator.isEqual(
                                result.getOutput(),
                                testCase.getExpectedOutput()
                        );


                // =============================================
                // Wrong answer
                // =============================================

                if (!outputMatches) {

                    submissionResultService.saveResult(

                            submission,

                            testCase,

                            TestCaseStatus.FAILED,

                            result.getOutput(),

                            result.getExecutionTimeMs(),

                            result.getMemoryUsedKb(),

                            "Wrong answer"
                    );


                    submission.setStatus(
                            SubmissionStatus.WRONG_ANSWER
                    );

                    submission.setErrorMessage(
                            "Wrong answer"
                    );

                    submission.setExecutionTimeMs(
                            result.getExecutionTimeMs()
                    );

                    submission.setMemoryUsedKb(
                            result.getMemoryUsedKb()
                    );

                    return;
                }


                // =============================================
                // Test case passed
                // =============================================

                submissionResultService.saveResult(

                        submission,

                        testCase,

                        TestCaseStatus.PASSED,

                        result.getOutput(),

                        result.getExecutionTimeMs(),

                        result.getMemoryUsedKb(),

                        null
                );


                // Keep latest execution statistics
                submission.setExecutionTimeMs(
                        result.getExecutionTimeMs()
                );

                submission.setMemoryUsedKb(
                        result.getMemoryUsedKb()
                );
            }


            // -------------------------------------------------
            // ALL TEST CASES PASSED
            // -------------------------------------------------

            submission.setStatus(
                    SubmissionStatus.ACCEPTED
            );

            submission.setErrorMessage(null);


        } catch (Exception exception) {

            submission.setStatus(
                    SubmissionStatus.RUNTIME_ERROR
            );

            submission.setErrorMessage(
                    exception.getMessage()
            );
        }
    }


    // =========================================================
    // GET CURRENT USER SUBMISSIONS
    // =========================================================

    public List<SubmissionResponse> getMySubmissions() {

        User user =
                getCurrentUser();

        return submissionRepository
                .findByUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }
    // =========================================================
    // GET ALL SUBMISSIONS - ADMIN
    // =========================================================

    public List<SubmissionResponse> getAllSubmissions() {

        return submissionRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET SUBMISSION BY ID
    // =========================================================

    public SubmissionResponse getSubmissionById(
            Long id) {

        User user =
                getCurrentUser();

        Submission submission =
                submissionRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Submission not found with id: "
                                                + id
                                )
                        );


        if (!submission
                .getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to view this submission"
            );
        }


        return convertToResponse(
                submission
        );
    }


    // =========================================================
    // GET CURRENT LOGGED-IN USER
    // =========================================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }


        String email =
                authentication.getName();


        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Current user not found"
                        )
                );
    }


    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private SubmissionResponse convertToResponse(
            Submission submission) {

        Long userId =
                submission.getUser().getId();

        Long problemId =
                submission.getProblem().getId();

        // =============================================
        // TEST CASE STATISTICS
        // =============================================

        List<com.codingplatform.coding_platform.submissionresult.dto.SubmissionResultResponse>
                results =
                submissionResultService
                        .getResultsBySubmissionId(
                                submission.getId()
                        );

        int passedCount =
                (int) results.stream()
                        .filter(result ->
                                result.getStatus()
                                        == TestCaseStatus.PASSED
                        )
                        .count();

        int totalCount =
                testCaseRepository
                        .findByProblemId(problemId)
                        .size();

        // =============================================
        // ATTEMPT STATISTICS
        // =============================================

        long totalAttempts =
                submissionRepository
                        .countByUserIdAndProblemId(
                                userId,
                                problemId
                        );

        long correctAttempts =
                submissionRepository
                        .countByUserIdAndProblemIdAndStatus(
                                userId,
                                problemId,
                                SubmissionStatus.ACCEPTED
                        );

        // =============================================
        // ACCURACY
        // =============================================

        double accuracy = 0.0;

        if (totalAttempts > 0) {

            accuracy =
                    Math.round(
                            (correctAttempts * 10000.0)
                                    / totalAttempts
                    ) / 100.0;
        }

        // =============================================
        // RESPONSE
        // =============================================

        return new SubmissionResponse(

                submission.getId(),

                userId,

                problemId,

                submission.getLanguage(),

                submission.getStatus(),

                submission.getExecutionTimeMs(),

                submission.getMemoryUsedKb(),

                submission.getErrorMessage(),

                submission.getCreatedAt(),

                passedCount,

                totalCount,

                correctAttempts,

                totalAttempts,

                accuracy
        );
    }
    public ExecutionResult runCode(RunRequest request) {

        // Make sure user is authenticated
        getCurrentUser();

        // Find problem
        Problem problem =
                problemRepository.findById(
                        request.getProblemId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Problem not found with id: "
                                        + request.getProblemId()
                        )
                );

        // Find test case
        TestCase testCase =
                testCaseRepository.findById(
                        request.getTestCaseId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Test case not found with id: "
                                        + request.getTestCaseId()
                        )
                );

        // Make sure test case belongs to this problem
        if (!testCase.getProblem()
                .getId()
                .equals(problem.getId())) {

            throw new RuntimeException(
                    "Test case does not belong to this problem"
            );
        }

        // Execute code
        return codeExecutionService.execute(
                request.getSourceCode(),
                testCase.getInput(),
                request.getLanguage(),
                testCase.getTimeLimitMs()
        );
    }
}