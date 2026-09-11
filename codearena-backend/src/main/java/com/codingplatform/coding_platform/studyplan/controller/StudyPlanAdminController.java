package com.codingplatform.coding_platform.studyplan.controller;

import com.codingplatform.coding_platform.studyplan.dto.StudyPlanProblemRequest;
import com.codingplatform.coding_platform.studyplan.dto.StudyPlanProblemResponse;
import com.codingplatform.coding_platform.studyplan.dto.StudyPlanRequest;
import com.codingplatform.coding_platform.studyplan.dto.StudyPlanResponse;
import com.codingplatform.coding_platform.studyplan.service.StudyPlanService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/study-plans")
@RequiredArgsConstructor
public class StudyPlanAdminController {

    private final StudyPlanService studyPlanService;


    // =====================================================
    // CREATE STUDY PLAN
    // =====================================================

    @PostMapping
    public ResponseEntity<StudyPlanResponse>
    createPlan(
            @Valid @RequestBody StudyPlanRequest request) {

        StudyPlanResponse response =
                studyPlanService.createPlan(
                        request.getName(),
                        request.getSlug(),
                        request.getDescription()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =====================================================
    // ADD PROBLEM
    // =====================================================

    @PostMapping("/{planId}/problems")
    public ResponseEntity<StudyPlanProblemResponse>
    addProblem(
            @PathVariable Long planId,
            @Valid @RequestBody
            StudyPlanProblemRequest request) {

        StudyPlanProblemResponse response =
                studyPlanService.addProblem(
                        planId,
                        request.getProblemId(),
                        request.getOrderNumber()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =====================================================
    // REMOVE PROBLEM
    // =====================================================

    @DeleteMapping("/problems/{planProblemId}")
    public ResponseEntity<Void>
    removeProblem(
            @PathVariable Long planProblemId) {

        studyPlanService.removeProblem(
                planProblemId
        );

        return ResponseEntity.noContent().build();
    }


    // =====================================================
    // DELETE PLAN
    // =====================================================

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void>
    deletePlan(
            @PathVariable Long planId) {

        studyPlanService.deletePlan(
                planId
        );

        return ResponseEntity.noContent().build();
    }
}