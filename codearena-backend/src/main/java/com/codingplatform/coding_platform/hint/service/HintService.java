package com.codingplatform.coding_platform.hint.service;

import java.util.List;

import com.codingplatform.coding_platform.hint.dto.EditorialResponse;
import com.codingplatform.coding_platform.hint.dto.HintResponse;
import com.codingplatform.coding_platform.problem.entity.Problem;
import com.codingplatform.coding_platform.problem.repository.ProblemRepository;
import com.codingplatform.coding_platform.submission.entity.SubmissionStatus;
import com.codingplatform.coding_platform.submission.repository.SubmissionRepository;
import com.codingplatform.coding_platform.users.entity.User;
import com.codingplatform.coding_platform.users.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HintService {

    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;


    // GET HINT
    public HintResponse getHint(Long problemId) {

        Problem problem = getProblem(problemId);

        return new HintResponse(
                problem.getId(),
                problem.getHints()
        );
    }


    // GET EDITORIAL
    public EditorialResponse getEditorial(Long problemId) {

        User user = getCurrentUser();

        Problem problem = getProblem(problemId);

        int failedAttempts = getFailedAttempts(
                user.getId(),
                problemId
        );

        int requiredAttempts =
                problem.getEditorialUnlockAttempts();

        boolean unlocked =
                failedAttempts >= requiredAttempts;

        String editorial = null;

        if (unlocked) {
            editorial = problem.getEditorial();
        }

        return new EditorialResponse(
                problemId,
                unlocked,
                editorial,
                failedAttempts,
                requiredAttempts
        );
    }


    private int getFailedAttempts(
            Long userId,
            Long problemId) {

        List<SubmissionStatus> failedStatuses =
                List.of(

                        SubmissionStatus.WRONG_ANSWER,

                        SubmissionStatus.RUNTIME_ERROR,

                        SubmissionStatus.TIME_LIMIT_EXCEEDED,

                        SubmissionStatus.MEMORY_LIMIT_EXCEEDED
                );

        return (int) submissionRepository
                .countByUserIdAndProblemIdAndStatusIn(
                        userId,
                        problemId,
                        failedStatuses
                );
    }


    private Problem getProblem(Long problemId) {

        return problemRepository.findById(problemId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Problem not found with id: "
                                        + problemId
                        )
                );
    }


    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Current user not found"
                        )
                );
    }
}
