package com.codingplatform.coding_platform.leaderboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LeaderboardResponse {

    private Integer rank;

    private Long userId;

    private String username;

    private Integer problemsSolved;

    private Integer totalScore;

    private Double acceptanceRate;

    private Long fastestSubmissionTimeMs;
}
