package com.codingplatform.coding_platform.problem.service;

import java.util.List;

import com.codingplatform.coding_platform.exception.ResourceNotFoundException;
import com.codingplatform.coding_platform.hint.dto.EditorialResponse;
import com.codingplatform.coding_platform.problem.dto.ProblemRequest;
import com.codingplatform.coding_platform.problem.dto.ProblemResponse;
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
public class ProblemService {

    private final ProblemRepository problemRepository;

    private final SubmissionRepository submissionRepository;

    private final UserRepository userRepository;


    // CREATE
    public ProblemResponse createProblem(
            ProblemRequest request) {

        Problem problem = new Problem();

        problem.setTitle(
                request.getTitle()
        );

        problem.setDescription(
                request.getDescription()
        );

        problem.setDifficulty(
                request.getDifficulty()
        );

        problem.setTopic(
                request.getTopic()
        );

        problem.setStarterCodeJava(
                request.getStarterCodeJava()
        );

        problem.setStarterCodePython(
                request.getStarterCodePython()
        );

        problem.setStarterCodeCpp(
                request.getStarterCodeCpp()
        );

        problem.setStarterCodeJavascript(
                request.getStarterCodeJavascript()
        );

        problem.setEditorial(
                request.getEditorial()
        );

        problem.setHints(
                request.getHints()
        );

        problem.setEditorialUnlockAttempts(
                request.getEditorialUnlockAttempts()
        );

        problem.setExamples(
                request.getExamples()
        );

        problem.setConstraints(
                request.getConstraints()
        );

        Problem savedProblem =
                problemRepository.save(problem);

        return convertToResponse(savedProblem);
    }


    // GET ALL
    public List<ProblemResponse> getAllProblems() {

        return problemRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // GET BY ID
    public ProblemResponse getProblemById(Long id) {

        Problem problem =
                problemRepository.findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Problem not found with id: " + id
                                )
                        );

        return convertToResponse(problem);
    }


    // UPDATE
    public ProblemResponse updateProblem(
            Long id,
            ProblemRequest request) {

        Problem problem =
                problemRepository.findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Problem not found with id: " + id
                                )
                        );

        problem.setTitle(
                request.getTitle()
        );

        problem.setDescription(
                request.getDescription()
        );

        problem.setDifficulty(
                request.getDifficulty()
        );

        problem.setTopic(
                request.getTopic()
        );

        problem.setStarterCodeJava(
                request.getStarterCodeJava()
        );

        problem.setStarterCodePython(
                request.getStarterCodePython()
        );

        problem.setStarterCodeCpp(
                request.getStarterCodeCpp()
        );

        problem.setStarterCodeJavascript(
                request.getStarterCodeJavascript()
        );

        problem.setEditorial(
                request.getEditorial()
        );

        problem.setHints(
                request.getHints()
        );

        problem.setEditorialUnlockAttempts(
                request.getEditorialUnlockAttempts()
        );

        problem.setExamples(
                request.getExamples()
        );

        problem.setConstraints(
                request.getConstraints()
        );

        Problem updatedProblem =
                problemRepository.save(problem);

        return convertToResponse(updatedProblem);
    }


    // DELETE
    public void deleteProblem(Long id) {

        if (!problemRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Problem not found with id: " + id
            );
        }

        problemRepository.deleteById(id);
    }


    // CONVERT TO RESPONSE
    private ProblemResponse convertToResponse(
            Problem problem) {

        ProblemResponse response =
                new ProblemResponse();

        response.setId(
                problem.getId()
        );

        response.setTitle(
                problem.getTitle()
        );

        response.setDescription(
                problem.getDescription()
        );

        response.setDifficulty(
                problem.getDifficulty()
        );

        response.setTopic(
                problem.getTopic()
        );

        response.setStarterCodeJava(
                problem.getStarterCodeJava()
        );

        response.setStarterCodePython(
                problem.getStarterCodePython()
        );

        response.setStarterCodeCpp(
                problem.getStarterCodeCpp()
        );

        response.setStarterCodeJavascript(
                problem.getStarterCodeJavascript()
        );

        response.setEditorial(
                problem.getEditorial()
        );

        response.setHints(
                problem.getHints()
        );

        response.setEditorialUnlockAttempts(
                problem.getEditorialUnlockAttempts()
        );

        response.setExamples(
                problem.getExamples()
        );

        response.setConstraints(
                problem.getConstraints()
        );


        // -----------------------------------------
        // ACCEPTANCE RATE
        // -----------------------------------------

        long totalSubmissions =
                submissionRepository.countByProblemId(
                        problem.getId()
                );

        long acceptedSubmissions =
                submissionRepository.countByProblemIdAndStatus(
                        problem.getId(),
                        SubmissionStatus.ACCEPTED
                );

        double acceptanceRate = 0.0;

        if (totalSubmissions > 0) {

            acceptanceRate =
                    Math.round(
                            (acceptedSubmissions * 10000.0)
                                    / totalSubmissions
                    ) / 100.0;
        }

        response.setAcceptanceRate(
                acceptanceRate
        );


        // -----------------------------------------
        // SOLVED STATUS (for the current logged-in user)
        // -----------------------------------------
        //
        // Uses getCurrentUserOrNull() rather than getCurrentUser() because
        // this endpoint (GET /problems) may be hit by an unauthenticated
        // request depending on your security config — that should show
        // every problem as unsolved, not throw a 500.
        //
        // NOTE ON PERFORMANCE: this adds one query per problem (on top of
        // the two already run above for acceptance rate), so listing N
        // problems now runs 3N queries. Fine for getting this working
        // today; if the problem list grows large, the real fix is a single
        // batched query (e.g. SubmissionRepository.findSolvedProblemIds(
        // userId, List<problemId>, ACCEPTED) run once outside this loop)
        // instead of one query per problem inside it.
        // -----------------------------------------

        User currentUser = getCurrentUserOrNull();

        boolean solved = false;

        if (currentUser != null) {

            long acceptedByCurrentUser =
                    submissionRepository.countByUserIdAndProblemIdAndStatus(
                            currentUser.getId(),
                            problem.getId(),
                            SubmissionStatus.ACCEPTED
                    );

            solved = acceptedByCurrentUser > 0;
        }

        response.setSolved(solved);


        return response;
    }
    public EditorialResponse getEditorial(Long problemId) {

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() ->
                        new RuntimeException("Problem not found")
                );

        User user = getCurrentUser();

        int failedAttempts =
                (int) submissionRepository.countByUserIdAndProblemIdAndStatus(
                        user.getId(),
                        problemId,
                        SubmissionStatus.WRONG_ANSWER
                );

        int requiredAttempts =
                problem.getEditorialUnlockAttempts() != null
                        ? problem.getEditorialUnlockAttempts()
                        : 3;

        boolean unlocked =
                failedAttempts >= requiredAttempts;

        return new EditorialResponse(
                problem.getId(),
                unlocked,
                unlocked ? problem.getEditorial() : null,
                failedAttempts,
                requiredAttempts
        );
    }
    private User getCurrentUser() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Authenticated user not found")
                );
    }

    // Same lookup as getCurrentUser(), but returns null instead of
    // throwing when there's no authenticated user (anonymous request) or
    // the authenticated principal doesn't map to a real User row. Used by
    // endpoints like GET /problems that must still respond successfully
    // for logged-out visitors.
    private User getCurrentUserOrNull() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return null;
        }

        return userRepository.findByEmail(authentication.getName())
                .orElse(null);
    }
}