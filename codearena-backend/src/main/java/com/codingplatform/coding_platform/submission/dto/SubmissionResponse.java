package com.codingplatform.coding_platform.submission.dto;

import java.time.LocalDateTime;


import com.codingplatform.coding_platform.submission.entity.ProgrammingLanguage;
import com.codingplatform.coding_platform.submission.entity.SubmissionStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SubmissionResponse {

    private Long id;

    private Long userId;

    private Long problemId;

    private ProgrammingLanguage language;

    private SubmissionStatus status;

    private Long executionTimeMs;

    private Long memoryUsedKb;

    private String errorMessage;

    private LocalDateTime createdAt;
}
