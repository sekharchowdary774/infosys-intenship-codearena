package com.codingplatform.coding_platform.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalProblems;

    private long totalUsers;

    private long totalSubmissions;

    private long activeToday;
}