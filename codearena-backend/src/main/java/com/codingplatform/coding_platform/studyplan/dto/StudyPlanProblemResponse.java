package com.codingplatform.coding_platform.studyplan.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudyPlanProblemResponse {

    private Long id;

    private Long problemId;

    private String title;

    private String difficulty;

    private String topic;

    private Integer orderNumber;
}