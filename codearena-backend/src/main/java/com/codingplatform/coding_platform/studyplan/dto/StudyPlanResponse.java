package com.codingplatform.coding_platform.studyplan.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudyPlanResponse {

    private Long id;

    private String name;

    private String slug;

    private String description;

    private Long totalProblems;

    private Long solvedProblems;

    private Double progressPercentage;
}