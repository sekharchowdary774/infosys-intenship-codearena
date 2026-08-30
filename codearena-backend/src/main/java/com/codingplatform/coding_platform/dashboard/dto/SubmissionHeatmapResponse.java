package com.codingplatform.coding_platform.dashboard.dto;


import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SubmissionHeatmapResponse {

    private LocalDate date;

    private Long count;
}
