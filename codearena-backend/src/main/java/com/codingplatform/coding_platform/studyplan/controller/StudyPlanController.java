package com.codingplatform.coding_platform.studyplan.controller;

import com.codingplatform.coding_platform.studyplan.dto.StudyPlanProblemResponse;
import com.codingplatform.coding_platform.studyplan.dto.StudyPlanResponse;
import com.codingplatform.coding_platform.studyplan.service.StudyPlanService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-plans")
@RequiredArgsConstructor
public class StudyPlanController {

    private final StudyPlanService studyPlanService;


    // =====================================================
    // GET ALL PLANS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<StudyPlanResponse>>
    getAllPlans() {

        return ResponseEntity.ok(
                studyPlanService.getAllPlans()
        );
    }


    // =====================================================
    // GET ONE PLAN
    // =====================================================

    @GetMapping("/{planId}")
    public ResponseEntity<StudyPlanResponse>
    getPlan(
            @PathVariable Long planId) {

        return ResponseEntity.ok(
                studyPlanService.getPlan(planId)
        );
    }


    // =====================================================
    // GET PLAN PROBLEMS
    // =====================================================

    @GetMapping("/{planId}/problems")
    public ResponseEntity<List<StudyPlanProblemResponse>>
    getPlanProblems(
            @PathVariable Long planId) {

        return ResponseEntity.ok(
                studyPlanService.getPlanProblems(planId)
        );
    }
}