package com.codingplatform.coding_platform.submissionresult.service;

import java.util.List;

import com.codingplatform.coding_platform.submission.entity.Submission;
import com.codingplatform.coding_platform.submissionresult.dto.SubmissionResultResponse;
import com.codingplatform.coding_platform.submissionresult.entity.SubmissionResult;
import com.codingplatform.coding_platform.submissionresult.entity.TestCaseStatus;
import com.codingplatform.coding_platform.submissionresult.repository.SubmissionResultRepository;
import com.codingplatform.coding_platform.testcase.entity.TestCase;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionResultService {

    private final SubmissionResultRepository
            submissionResultRepository;


    public SubmissionResult saveResult(
            Submission submission,
            TestCase testCase,
            TestCaseStatus status,
            String actualOutput,
            Long executionTimeMs,
            Long memoryUsedKb,
            String errorMessage) {

        SubmissionResult result =
                new SubmissionResult();

        result.setSubmission(submission);

        result.setTestCase(testCase);

        result.setStatus(status);

        result.setActualOutput(actualOutput);

        result.setExecutionTimeMs(executionTimeMs);

        result.setMemoryUsedKb(memoryUsedKb);

        result.setErrorMessage(errorMessage);

        return submissionResultRepository.save(result);
    }


    public List<SubmissionResultResponse>
    getResultsBySubmissionId(
            Long submissionId) {

        return submissionResultRepository
                .findBySubmissionIdOrderByIdAsc(
                        submissionId
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    private SubmissionResultResponse convertToResponse(
            SubmissionResult result) {

        return new SubmissionResultResponse(

                result.getId(),

                result.getTestCase().getId(),

                result.getStatus(),

                result.getActualOutput(),

                result.getExecutionTimeMs(),

                result.getMemoryUsedKb(),

                result.getErrorMessage()
        );
    }
}
