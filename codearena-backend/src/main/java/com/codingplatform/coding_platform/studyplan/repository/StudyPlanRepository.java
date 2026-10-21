package com.codingplatform.coding_platform.studyplan.repository;

import com.codingplatform.coding_platform.studyplan.entity.StudyPlan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudyPlanRepository
        extends JpaRepository<StudyPlan, Long> {

    Optional<StudyPlan> findBySlug(String slug);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);
}