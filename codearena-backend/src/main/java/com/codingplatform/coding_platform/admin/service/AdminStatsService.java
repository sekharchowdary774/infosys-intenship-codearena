package com.codingplatform.coding_platform.admin.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.codingplatform.coding_platform.admin.dto.AdminStatsResponse;
import com.codingplatform.coding_platform.common.Role;
import com.codingplatform.coding_platform.problem.repository.ProblemRepository;
import com.codingplatform.coding_platform.submission.repository.SubmissionRepository;
import com.codingplatform.coding_platform.users.repository.UserRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final ProblemRepository problemRepository;

    private final UserRepository userRepository;

    private final SubmissionRepository submissionRepository;


    public AdminStatsResponse getStats() {

        long totalProblems =
                problemRepository.count();


        long totalUsers =
                userRepository.countByRole(Role.USER);


        long totalSubmissions =
                submissionRepository.count();


        LocalDate today =
                LocalDate.now();

        LocalDateTime startOfDay =
                today.atStartOfDay();

        LocalDateTime endOfDay =
                LocalDateTime.of(
                        today,
                        LocalTime.MAX
                );


        long activeToday =
                userRepository.countByCreatedAtBetween(
                        startOfDay,
                        endOfDay
                );


        return new AdminStatsResponse(
                totalProblems,
                totalUsers,
                totalSubmissions,
                activeToday
        );
    }
}