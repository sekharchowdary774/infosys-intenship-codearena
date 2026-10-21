package com.codingplatform.coding_platform.testcase.service;

import java.util.List;

import com.codingplatform.coding_platform.exception.ResourceNotFoundException;
import com.codingplatform.coding_platform.problem.entity.Problem;
import com.codingplatform.coding_platform.problem.repository.ProblemRepository;
import com.codingplatform.coding_platform.testcase.dto.TestCaseRequest;
import com.codingplatform.coding_platform.testcase.dto.TestCaseResponse;
import com.codingplatform.coding_platform.testcase.entity.TestCase;
import com.codingplatform.coding_platform.testcase.repository.TestCaseRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;

    private final ProblemRepository problemRepository;


    // CREATE TEST CASE
    public TestCaseResponse createTestCase(
            TestCaseRequest request) {

        Problem problem =
                problemRepository.findById(
                        request.getProblemId()
                ).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Problem not found with id: " + request.getProblemId()
                        )
                );

        TestCase testCase = new TestCase();

        testCase.setProblem(problem);

        testCase.setInput(request.getInput());

        testCase.setExpectedOutput(
                request.getExpectedOutput()
        );

        testCase.setHidden(request.isHidden());

        testCase.setTimeLimitMs(
                request.getTimeLimitMs()
        );

        TestCase savedTestCase =
                testCaseRepository.save(testCase);

        return convertToResponse(savedTestCase);
    }


    // GET ALL TEST CASES FOR A PROBLEM
    public List<TestCaseResponse> getTestCasesByProblem(
            Long problemId) {

        if (!problemRepository.existsById(problemId)) {

            throw new ResourceNotFoundException(
                    "Problem not found with id: " + problemId
            );
        }

        return testCaseRepository
                .findByProblemId(problemId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // GET TEST CASE BY ID
    public TestCaseResponse getTestCaseById(
            Long id) {

        TestCase testCase =
                testCaseRepository.findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Test case not found with id: " + id
                                )

                        );

        return convertToResponse(testCase);
    }


    // UPDATE TEST CASE
    public TestCaseResponse updateTestCase(
            Long id,
            TestCaseRequest request) {

        TestCase testCase =
                testCaseRepository.findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Test case not found with id: " + id
                                )
                        );

        Problem problem =
                problemRepository.findById(
                        request.getProblemId()
                ).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Problem not found with id: " + request.getProblemId()
                        )
                );

        testCase.setProblem(problem);

        testCase.setInput(request.getInput());

        testCase.setExpectedOutput(
                request.getExpectedOutput()
        );

        testCase.setHidden(request.isHidden());

        testCase.setTimeLimitMs(
                request.getTimeLimitMs()
        );

        TestCase updatedTestCase =
                testCaseRepository.save(testCase);

        return convertToResponse(updatedTestCase);
    }


    // DELETE TEST CASE
    public void deleteTestCase(Long id) {

        if (!testCaseRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Test case not found with id: " + id
            );
        }

        testCaseRepository.deleteById(id);
    }


    // CONVERT TO RESPONSE
    private TestCaseResponse convertToResponse(
            TestCase testCase) {

        return new TestCaseResponse(
                testCase.getId(),
                testCase.getProblem().getId(),
                testCase.getInput(),
                testCase.getExpectedOutput(),
                testCase.isHidden(),
                testCase.getTimeLimitMs()
        );
    }
}