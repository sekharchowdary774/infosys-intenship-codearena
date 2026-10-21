package com.codingplatform.coding_platform.submission.controller;

import java.util.List;

import com.codingplatform.coding_platform.execution.dto.ExecutionResult;
import com.codingplatform.coding_platform.submission.dto.RunRequest;
import com.codingplatform.coding_platform.submission.dto.SubmissionRequest;
import com.codingplatform.coding_platform.submission.dto.SubmissionResponse;
import com.codingplatform.coding_platform.submission.service.SubmissionService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;


    // SUBMIT CODE
    @PostMapping
    public ResponseEntity<SubmissionResponse> createSubmission(
            @Valid @RequestBody SubmissionRequest request) {

        SubmissionResponse response =
                submissionService.createSubmission(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // GET MY SUBMISSIONS
    @GetMapping("/my")
    public ResponseEntity<List<SubmissionResponse>>
    getMySubmissions() {

        return ResponseEntity.ok(
                submissionService.getMySubmissions()
        );
    }


    // GET ONE SUBMISSION
    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse>
    getSubmissionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                submissionService.getSubmissionById(id)
        );
    }
    @PostMapping("/run")
    public ResponseEntity<ExecutionResult> runCode(
            @Valid @RequestBody RunRequest request) {

        return ResponseEntity.ok(
                submissionService.runCode(request)
        );
    }
    @GetMapping("/admin")
    public ResponseEntity<List<SubmissionResponse>>
    getAllSubmissions() {

        return ResponseEntity.ok(
                submissionService.getAllSubmissions()
        );
    }
}
