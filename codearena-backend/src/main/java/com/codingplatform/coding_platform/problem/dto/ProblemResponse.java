package com.codingplatform.coding_platform.problem.dto;

import com.codingplatform.coding_platform.problem.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProblemResponse {

    private Long id;

    private String title;

    private String description;

    private Difficulty difficulty;

    private String topic;

    private String examples;

    private String constraints;

    private String starterCodeJava;

    private String starterCodePython;

    private String starterCodeCpp;

    private String starterCodeJavascript;

    private String editorial;

    private String hints;

    private Integer editorialUnlockAttempts;

    private Double acceptanceRate;

    // True if the CURRENT LOGGED-IN USER has at least one ACCEPTED
    // submission for this problem. False (not null) for anonymous/
    // unauthenticated requests, so the frontend's checkmark logic
    // (isProblemSolved) always gets a real boolean to check.
    private Boolean solved;
}