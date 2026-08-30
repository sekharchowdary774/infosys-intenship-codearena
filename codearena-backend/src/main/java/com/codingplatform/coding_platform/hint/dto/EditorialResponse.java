package com.codingplatform.coding_platform.hint.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EditorialResponse {

    private Long problemId;

    private boolean unlocked;

    private String editorial;

    private Integer failedAttempts;

    private Integer requiredAttempts;
}
