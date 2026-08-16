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

    private String starterCodeJava;

    private String starterCodePython;

    private String starterCodeCpp;

    private String starterCodeJavascript;

    private String editorial;

    private String hints;

    private Integer editorialUnlockAttempts;
}