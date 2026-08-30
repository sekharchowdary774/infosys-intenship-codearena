package com.codingplatform.coding_platform.submissionresult.dto;


import com.codingplatform.coding_platform.submissionresult.entity.TestCaseStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SubmissionResultResponse {

    private Long id;

    private Long testCaseId;

    private TestCaseStatus status;

    private String actualOutput;

    private Long executionTimeMs;

    private Long memoryUsedKb;

    private String errorMessage;
}
