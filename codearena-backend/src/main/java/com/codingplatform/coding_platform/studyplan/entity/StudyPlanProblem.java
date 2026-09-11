package com.codingplatform.coding_platform.studyplan.entity;

import com.codingplatform.coding_platform.problem.entity.Problem;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "study_plan_problems",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_study_plan_problem",
                        columnNames = {
                                "study_plan_id",
                                "problem_id"
                        }
                )
        }
)
@Getter
@Setter
public class StudyPlanProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "study_plan_id",
            nullable = false
    )
    private StudyPlan studyPlan;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "problem_id",
            nullable = false
    )
    private Problem problem;

    @Column(nullable = false)
    private Integer orderNumber;
}