package com.codingplatform.coding_platform.execution.service;


import com.codingplatform.coding_platform.execution.dto.ExecutionResult;
import com.codingplatform.coding_platform.submission.entity.ProgrammingLanguage;

public interface CodeExecutionService {

    ExecutionResult execute(
            String sourceCode,
            String input,
            ProgrammingLanguage language,
            Integer timeLimitMs
    );
}
