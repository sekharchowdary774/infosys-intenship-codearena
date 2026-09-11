package com.codingplatform.coding_platform.problem.controller;

import java.util.List;

import com.codingplatform.coding_platform.hint.dto.EditorialResponse;
import com.codingplatform.coding_platform.problem.dto.ProblemRequest;
import com.codingplatform.coding_platform.problem.dto.ProblemResponse;
import com.codingplatform.coding_platform.problem.service.ProblemService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;


    // CREATE PROBLEM
    @PostMapping
    public ResponseEntity<ProblemResponse> createProblem(
            @Valid @RequestBody ProblemRequest request) {

        ProblemResponse response =
                problemService.createProblem(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // GET ALL PROBLEMS
    @GetMapping
    public ResponseEntity<List<ProblemResponse>> getAllProblems() {

        return ResponseEntity.ok(
                problemService.getAllProblems()
        );
    }


    // GET PROBLEM BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponse> getProblemById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                problemService.getProblemById(id)
        );
    }


    // GET EDITORIAL
    @GetMapping("/{id}/editorial")
    public ResponseEntity<EditorialResponse> getEditorial(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                problemService.getEditorial(id)
        );
    }


    // UPDATE PROBLEM
    @PutMapping("/{id}")
    public ResponseEntity<ProblemResponse> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemRequest request) {

        return ResponseEntity.ok(
                problemService.updateProblem(id, request)
        );
    }


    // DELETE PROBLEM
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(
            @PathVariable Long id) {

        problemService.deleteProblem(id);

        return ResponseEntity.noContent().build();
    }
}