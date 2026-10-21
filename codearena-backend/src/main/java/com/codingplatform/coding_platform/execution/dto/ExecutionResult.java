package com.codingplatform.coding_platform.execution.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExecutionResult {

    private String output;

    private String error;

    private Long executionTimeMs;

    private Long memoryUsedKb;

    private boolean compilationError;

    private boolean timedOut;

    private boolean runtimeError;
}
