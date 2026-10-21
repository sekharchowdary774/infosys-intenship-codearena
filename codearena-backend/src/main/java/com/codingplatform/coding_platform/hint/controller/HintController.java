package com.codingplatform.coding_platform.hint.controller;

import com.codingplatform.coding_platform.hint.dto.EditorialResponse;
import com.codingplatform.coding_platform.hint.dto.HintResponse;
import com.codingplatform.coding_platform.hint.service.HintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/problems/{problemId}")
@RequiredArgsConstructor
public class HintController {

    private final HintService hintService;


    // GET HINT
    @GetMapping("/hint")
    public ResponseEntity<HintResponse> getHint(
            @PathVariable Long problemId) {

        return ResponseEntity.ok(
                hintService.getHint(problemId)
        );
    }


    // GET EDITORIAL
    @GetMapping("/editorial")
    public ResponseEntity<EditorialResponse> getEditorial(
            @PathVariable Long problemId) {

        return ResponseEntity.ok(
                hintService.getEditorial(problemId)
        );
    }
}
