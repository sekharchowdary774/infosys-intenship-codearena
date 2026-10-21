package com.codingplatform.coding_platform.studyplan.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudyPlanProblemRequest {

    @NotNull(message = "Problem ID is required")
    private Long problemId;

    @NotNull(message = "Order number is required")
    @Positive(message = "Order number must be greater than zero")
    private Integer orderNumber;
}