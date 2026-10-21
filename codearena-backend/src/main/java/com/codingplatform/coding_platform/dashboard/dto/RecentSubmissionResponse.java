package com.codingplatform.coding_platform.dashboard.dto;

import java.time.LocalDateTime;


import com.codingplatform.coding_platform.submission.entity.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RecentSubmissionResponse {

    private Long submissionId;

    private Long problemId;

    private String problemTitle;

    private String language;

    private SubmissionStatus status;

    private Long executionTimeMs;

    private LocalDateTime submittedAt;
}
