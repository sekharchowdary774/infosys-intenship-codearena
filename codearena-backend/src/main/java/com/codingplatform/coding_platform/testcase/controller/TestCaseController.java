package com.codingplatform.coding_platform.testcase.controller;


import java.util.List;

import com.codingplatform.coding_platform.testcase.dto.TestCaseRequest;
import com.codingplatform.coding_platform.testcase.dto.TestCaseResponse;
import com.codingplatform.coding_platform.testcase.service.TestCaseService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/test-cases")
@RequiredArgsConstructor
public class TestCaseController {

    private final TestCaseService testCaseService;


    // CREATE TEST CASE
    @PostMapping
    public ResponseEntity<TestCaseResponse> createTestCase(
            @Valid @RequestBody TestCaseRequest request) {

        TestCaseResponse response =
                testCaseService.createTestCase(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // GET TEST CASES FOR PROBLEM
    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<TestCaseResponse>> getTestCasesByProblem(
            @PathVariable Long problemId) {

        return ResponseEntity.ok(
                testCaseService.getTestCasesByProblem(
                        problemId
                )
        );
    }


    // GET TEST CASE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<TestCaseResponse> getTestCaseById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                testCaseService.getTestCaseById(id)
        );
    }


    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<TestCaseResponse> updateTestCase(
            @PathVariable Long id,
            @Valid @RequestBody TestCaseRequest request) {

        return ResponseEntity.ok(
                testCaseService.updateTestCase(
                        id,
                        request
                )
        );
    }


    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestCase(
            @PathVariable Long id) {

        testCaseService.deleteTestCase(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}
