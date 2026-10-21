package com.codingplatform.coding_platform.testcase.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TestCaseRequest {

    @NotNull(message = "Problem ID is required")
    private Long problemId;

    @NotBlank(message = "Input is required")
    private String input;

    @NotBlank(message = "Expected output is required")
    private String expectedOutput;

    private boolean hidden = false;

    @Min(value = 100, message = "Time limit must be at least 100 ms")
    private Integer timeLimitMs = 5000;
}
