package com.codingplatform.coding_platform.submission.repository;

import java.util.List;

import com.codingplatform.coding_platform.problem.entity.Difficulty;
import com.codingplatform.coding_platform.submission.entity.Submission;
import com.codingplatform.coding_platform.submission.entity.SubmissionStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionRepository
        extends JpaRepository<Submission, Long> {

    // -------------------------------------------------
    // Get user's submissions
    // -------------------------------------------------

    List<Submission> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );


    // -------------------------------------------------
    // Get ALL submissions - ADMIN
    // -------------------------------------------------

    List<Submission> findAllByOrderByCreatedAtDesc();


    // -------------------------------------------------
    // Get submissions for a problem
    // -------------------------------------------------

    List<Submission> findByProblemIdOrderByCreatedAtDesc(
            Long problemId
    );


    // -------------------------------------------------
    // Get user's submissions for a specific problem
    // -------------------------------------------------

    List<Submission> findByUserIdAndProblemIdOrderByCreatedAtDesc(
            Long userId,
            Long problemId
    );


    // -------------------------------------------------
    // Count submissions for a user + problem + status
    // -------------------------------------------------

    long countByUserIdAndProblemIdAndStatus(
            Long userId,
            Long problemId,
            SubmissionStatus status
    );


    // -------------------------------------------------
    // Count unique problems solved by user
    // -------------------------------------------------

    long countDistinctProblemIdByUserIdAndStatus(
            Long userId,
            SubmissionStatus status
    );


    // -------------------------------------------------
    // Count unique solved problems by difficulty
    // -------------------------------------------------

    long countDistinctProblemIdByUserIdAndStatusAndProblemDifficulty(
            Long userId,
            SubmissionStatus status,
            Difficulty difficulty
    );


    long countByUserIdAndProblemIdAndStatusIn(
            Long userId,
            Long problemId,
            java.util.Collection<SubmissionStatus> statuses
    );


    long countByUserId(Long userId);


    long countByUserIdAndStatus(
            Long userId,
            SubmissionStatus status
    );


    List<Submission> findByUserIdAndStatus(
            Long userId,
            SubmissionStatus status
    );


    long countByUserIdAndProblemDifficultyAndStatus(
            Long userId,
            Difficulty difficulty,
            SubmissionStatus status
    );
    long countByProblemId(Long problemId);

    long countByProblemIdAndStatus(
            Long problemId,
            SubmissionStatus status
    );
    long countByUserIdAndProblemId(Long userId, Long problemId);

}
