package com.codingplatform.coding_platform.studyplan.service;

import com.codingplatform.coding_platform.problem.entity.Problem;
import com.codingplatform.coding_platform.problem.repository.ProblemRepository;
import com.codingplatform.coding_platform.studyplan.dto.StudyPlanProblemResponse;
import com.codingplatform.coding_platform.studyplan.dto.StudyPlanResponse;
import com.codingplatform.coding_platform.studyplan.entity.StudyPlan;
import com.codingplatform.coding_platform.studyplan.entity.StudyPlanProblem;
import com.codingplatform.coding_platform.studyplan.repository.StudyPlanProblemRepository;
import com.codingplatform.coding_platform.studyplan.repository.StudyPlanRepository;
import com.codingplatform.coding_platform.submission.entity.SubmissionStatus;
import com.codingplatform.coding_platform.submission.repository.SubmissionRepository;
import com.codingplatform.coding_platform.users.entity.User;
import com.codingplatform.coding_platform.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyPlanService {

    private final StudyPlanRepository studyPlanRepository;

    private final StudyPlanProblemRepository studyPlanProblemRepository;

    private final ProblemRepository problemRepository;

    private final SubmissionRepository submissionRepository;

    private final UserRepository userRepository;


    // =====================================================
    // GET ALL STUDY PLANS
    // =====================================================

    public List<StudyPlanResponse> getAllPlans() {

        return studyPlanRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =====================================================
    // GET ONE STUDY PLAN
    // =====================================================

    public StudyPlanResponse getPlan(Long planId) {

        StudyPlan plan =
                studyPlanRepository.findById(planId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Study plan not found"
                                )
                        );

        return convertToResponse(plan);
    }


    // =====================================================
    // GET PLAN PROBLEMS
    // =====================================================

    public List<StudyPlanProblemResponse> getPlanProblems(
            Long planId) {

        if (!studyPlanRepository.existsById(planId)) {

            throw new RuntimeException(
                    "Study plan not found"
            );
        }

        return studyPlanProblemRepository
                .findByStudyPlanIdOrderByOrderNumberAsc(planId)
                .stream()
                .map(this::convertProblemToResponse)
                .toList();
    }


    // =====================================================
    // CREATE STUDY PLAN
    // =====================================================

    public StudyPlanResponse createPlan(
            String name,
            String slug,
            String description) {

        if (studyPlanRepository.existsByName(name)) {

            throw new RuntimeException(
                    "Study plan name already exists"
            );
        }

        if (studyPlanRepository.existsBySlug(slug)) {

            throw new RuntimeException(
                    "Study plan slug already exists"
            );
        }

        StudyPlan plan = new StudyPlan();

        plan.setName(name);
        plan.setSlug(slug);
        plan.setDescription(description);

        StudyPlan saved =
                studyPlanRepository.save(plan);

        return convertToResponse(saved);
    }


    // =====================================================
    // ADD PROBLEM TO STUDY PLAN
    // =====================================================

    public StudyPlanProblemResponse addProblem(
            Long planId,
            Long problemId,
            Integer orderNumber) {

        StudyPlan plan =
                studyPlanRepository.findById(planId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Study plan not found"
                                )
                        );

        Problem problem =
                problemRepository.findById(problemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Problem not found"
                                )
                        );

        if (studyPlanProblemRepository
                .existsByStudyPlanIdAndProblemId(
                        planId,
                        problemId)) {

            throw new RuntimeException(
                    "Problem already exists in this study plan"
            );
        }

        if (orderNumber == null || orderNumber <= 0) {

            throw new RuntimeException(
                    "Order number must be greater than zero"
            );
        }

        StudyPlanProblem planProblem =
                new StudyPlanProblem();

        planProblem.setStudyPlan(plan);
        planProblem.setProblem(problem);
        planProblem.setOrderNumber(orderNumber);

        StudyPlanProblem saved =
                studyPlanProblemRepository.save(
                        planProblem
                );

        return convertProblemToResponse(saved);
    }


    // =====================================================
    // REMOVE PROBLEM
    // =====================================================

    public void removeProblem(Long planProblemId) {

        if (!studyPlanProblemRepository
                .existsById(planProblemId)) {

            throw new RuntimeException(
                    "Study plan problem not found"
            );
        }

        studyPlanProblemRepository.deleteById(
                planProblemId
        );
    }


    // =====================================================
    // DELETE STUDY PLAN
    // =====================================================

    @Transactional
    public void deletePlan(Long planId) {

        if (!studyPlanRepository.existsById(planId)) {

            throw new RuntimeException(
                    "Study plan not found"
            );
        }

        studyPlanProblemRepository
                .deleteByStudyPlanId(planId);

        studyPlanRepository.deleteById(planId);
    }


    // =====================================================
    // CONVERT PLAN TO RESPONSE
    // =====================================================

    private StudyPlanResponse convertToResponse(
            StudyPlan plan) {

        long totalProblems =
                studyPlanProblemRepository
                        .countByStudyPlanId(
                                plan.getId()
                        );

        long solvedProblems = 0;

        double progressPercentage = 0.0;


        // Calculate progress for logged-in user
        if (isAuthenticated()) {

            User user = getCurrentUser();

            List<StudyPlanProblem> planProblems =
                    studyPlanProblemRepository
                            .findByStudyPlanIdOrderByOrderNumberAsc(
                                    plan.getId()
                            );

            for (StudyPlanProblem planProblem :
                    planProblems) {

                long accepted =
                        submissionRepository
                                .countByUserIdAndProblemIdAndStatus(
                                        user.getId(),
                                        planProblem
                                                .getProblem()
                                                .getId(),
                                        SubmissionStatus.ACCEPTED
                                );

                if (accepted > 0) {
                    solvedProblems++;
                }
            }

            if (totalProblems > 0) {

                progressPercentage =
                        Math.round(
                                (solvedProblems * 10000.0)
                                        / totalProblems
                        ) / 100.0;
            }
        }


        return new StudyPlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getSlug(),
                plan.getDescription(),
                totalProblems,
                solvedProblems,
                progressPercentage
        );
    }


    // =====================================================
    // CONVERT PROBLEM TO RESPONSE
    // =====================================================

    private StudyPlanProblemResponse convertProblemToResponse(
            StudyPlanProblem planProblem) {

        Problem problem = planProblem.getProblem();

        return new StudyPlanProblemResponse(
                planProblem.getId(),
                problem.getId(),
                problem.getTitle(),
                problem.getDifficulty().name(),
                problem.getTopic(),
                planProblem.getOrderNumber()
        );
    }


    // =====================================================
    // CHECK AUTHENTICATION
    // =====================================================

    private boolean isAuthenticated() {

        var authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getName() != null;
    }


    // =====================================================
    // GET CURRENT USER
    // =====================================================

    private User getCurrentUser() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"
                        )
                );
    }
}