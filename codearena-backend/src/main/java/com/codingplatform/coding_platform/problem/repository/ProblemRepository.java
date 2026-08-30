package com.codingplatform.coding_platform.problem.repository;

import java.util.List;

import com.codingplatform.coding_platform.problem.entity.Difficulty;
import com.codingplatform.coding_platform.problem.entity.Problem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemRepository
        extends JpaRepository<Problem, Long> {

    List<Problem> findByDifficulty(
            Difficulty difficulty
    );

    List<Problem> findByTopicIgnoreCase(
            String topic
    );

    List<Problem> findByTitleContainingIgnoreCase(
            String title
    );

    long countByDifficulty(
            Difficulty difficulty
    );
}