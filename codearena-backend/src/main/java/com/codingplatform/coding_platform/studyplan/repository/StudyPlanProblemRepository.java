package com.codingplatform.coding_platform.studyplan.repository;

import com.codingplatform.coding_platform.studyplan.entity.StudyPlanProblem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyPlanProblemRepository
        extends JpaRepository<StudyPlanProblem, Long> {

    List<StudyPlanProblem>
    findByStudyPlanIdOrderByOrderNumberAsc(
            Long studyPlanId
    );

    boolean existsByStudyPlanIdAndProblemId(
            Long studyPlanId,
            Long problemId
    );

    long countByStudyPlanId(
            Long studyPlanId
    );

    void deleteByStudyPlanId(
            Long studyPlanId
    );
}