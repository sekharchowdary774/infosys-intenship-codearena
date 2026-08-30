package com.codingplatform.coding_platform.dashboard.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardResponse {

    // -------------------------------------------------
    // PROBLEM COUNTS
    // -------------------------------------------------

    private Long totalProblems;

    private Long totalProblemsSolved;


    // -------------------------------------------------
    // EASY
    // -------------------------------------------------

    private Long easyProblems;

    private Long easyProblemsSolved;


    // -------------------------------------------------
    // MEDIUM
    // -------------------------------------------------

    private Long mediumProblems;

    private Long mediumProblemsSolved;


    // -------------------------------------------------
    // HARD
    // -------------------------------------------------

    private Long hardProblems;

    private Long hardProblemsSolved;


    // -------------------------------------------------
    // SUBMISSIONS
    // -------------------------------------------------

    private Long totalSubmissions;

    private Long acceptedSubmissions;

    private Double successRate;


    // -------------------------------------------------
    // OTHER DASHBOARD DATA
    // -------------------------------------------------

    private List<LanguageUsageResponse> languageUsage;

    private List<RecentSubmissionResponse> recentSubmissions;

    private List<SubmissionHeatmapResponse> submissionHeatmap;

    private Long activeDays;

    private Integer maxStreak;

    private Integer currentRank;
}