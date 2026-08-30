package com.codingplatform.coding_platform.dashboard.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.codingplatform.coding_platform.dashboard.dto.DashboardResponse;
import com.codingplatform.coding_platform.dashboard.dto.LanguageUsageResponse;
import com.codingplatform.coding_platform.dashboard.dto.RecentSubmissionResponse;
import com.codingplatform.coding_platform.dashboard.dto.SubmissionHeatmapResponse;
import com.codingplatform.coding_platform.leaderboard.entity.LeaderboardEntry;
import com.codingplatform.coding_platform.leaderboard.repository.LeaderboardRepository;
import com.codingplatform.coding_platform.problem.entity.Difficulty;
import com.codingplatform.coding_platform.problem.repository.ProblemRepository;
import com.codingplatform.coding_platform.submission.entity.Submission;
import com.codingplatform.coding_platform.submission.entity.SubmissionStatus;
import com.codingplatform.coding_platform.submission.repository.SubmissionRepository;
import com.codingplatform.coding_platform.users.entity.User;
import com.codingplatform.coding_platform.users.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;

    private final SubmissionRepository submissionRepository;

    private final LeaderboardRepository leaderboardRepository;

    private final ProblemRepository problemRepository;


    // =========================================================
    // GET USER DASHBOARD
    // =========================================================

    public DashboardResponse getDashboard() {

        User user = getCurrentUser();


        // =====================================================
        // TOTAL PROBLEMS AVAILABLE ON PLATFORM
        // =====================================================

        long easyProblems =
                problemRepository.countByDifficulty(
                        Difficulty.EASY
                );

        long mediumProblems =
                problemRepository.countByDifficulty(
                        Difficulty.MEDIUM
                );

        long hardProblems =
                problemRepository.countByDifficulty(
                        Difficulty.HARD
                );

        long totalProblems =
                easyProblems
                        + mediumProblems
                        + hardProblems;


        // =====================================================
        // GET USER SUBMISSIONS
        // =====================================================

        List<Submission> submissions =
                submissionRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                user.getId()
                        );


        // =====================================================
        // ACCEPTED SUBMISSIONS
        // =====================================================

        List<Submission> acceptedSubmissions =
                submissions.stream()
                        .filter(submission ->
                                submission.getStatus()
                                        == SubmissionStatus.ACCEPTED
                        )
                        .toList();


        // =====================================================
        // TOTAL UNIQUE PROBLEMS SOLVED
        // =====================================================

        Set<Long> solvedProblemIds =
                acceptedSubmissions.stream()
                        .map(submission ->
                                submission
                                        .getProblem()
                                        .getId()
                        )
                        .collect(
                                Collectors.toSet()
                        );


        long totalProblemsSolved =
                solvedProblemIds.size();


        // =====================================================
        // EASY PROBLEMS SOLVED
        // =====================================================

        long easyProblemsSolved =
                getSolvedCountByDifficulty(
                        acceptedSubmissions,
                        Difficulty.EASY
                );


        // =====================================================
        // MEDIUM PROBLEMS SOLVED
        // =====================================================

        long mediumProblemsSolved =
                getSolvedCountByDifficulty(
                        acceptedSubmissions,
                        Difficulty.MEDIUM
                );


        // =====================================================
        // HARD PROBLEMS SOLVED
        // =====================================================

        long hardProblemsSolved =
                getSolvedCountByDifficulty(
                        acceptedSubmissions,
                        Difficulty.HARD
                );


        // =====================================================
        // SUBMISSION COUNTS
        // =====================================================

        long totalSubmissions =
                submissions.size();


        long acceptedSubmissionCount =
                acceptedSubmissions.size();


        // =====================================================
        // SUCCESS RATE
        // =====================================================

        double successRate =
                totalSubmissions == 0
                        ? 0.0
                        : (
                        (double) acceptedSubmissionCount
                                / totalSubmissions
                ) * 100;


        // =====================================================
        // LANGUAGE USAGE
        // =====================================================

        List<LanguageUsageResponse> languageUsage =
                getLanguageUsage(
                        submissions
                );


        // =====================================================
        // RECENT SUBMISSIONS
        // =====================================================

        List<RecentSubmissionResponse> recentSubmissions =
                getRecentSubmissions(
                        submissions
                );


        // =====================================================
        // SUBMISSION HEATMAP
        // =====================================================

        Map<LocalDate, Long> submissionByDate =
                submissions.stream()
                        .filter(submission ->
                                submission.getCreatedAt() != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        submission ->
                                                submission
                                                        .getCreatedAt()
                                                        .toLocalDate(),
                                        Collectors.counting()
                                )
                        );


        List<SubmissionHeatmapResponse> heatmap =
                getSubmissionHeatmap(
                        submissionByDate
                );


        // =====================================================
        // ACTIVE DAYS
        // =====================================================

        long activeDays =
                submissionByDate.size();


        // =====================================================
        // MAX STREAK
        // =====================================================

        int maxStreak =
                calculateMaxStreak(
                        submissionByDate
                );


        // =====================================================
        // CURRENT RANK
        // =====================================================

        Integer currentRank =
                getCurrentRank(
                        user.getId()
                );


        // =====================================================
        // RESPONSE
        // =====================================================

        return new DashboardResponse(

                totalProblems,
                totalProblemsSolved,

                easyProblems,
                easyProblemsSolved,

                mediumProblems,
                mediumProblemsSolved,

                hardProblems,
                hardProblemsSolved,

                totalSubmissions,
                acceptedSubmissionCount,

                Math.round(
                        successRate * 100.0
                ) / 100.0,

                languageUsage,

                recentSubmissions,

                heatmap,

                activeDays,

                maxStreak,

                currentRank
        );
    }


    // =========================================================
    // SOLVED COUNT BY DIFFICULTY
    // =========================================================

    private long getSolvedCountByDifficulty(
            List<Submission> acceptedSubmissions,
            Difficulty difficulty) {

        return acceptedSubmissions.stream()

                .filter(submission ->
                        submission
                                .getProblem()
                                .getDifficulty()
                                == difficulty
                )

                .map(submission ->
                        submission
                                .getProblem()
                                .getId()
                )

                .distinct()

                .count();
    }


    // =========================================================
    // LANGUAGE USAGE
    // =========================================================

    private List<LanguageUsageResponse> getLanguageUsage(
            List<Submission> submissions) {

        Map<String, Long> languageCount =
                submissions.stream()

                        .filter(submission ->
                                submission.getLanguage() != null
                        )

                        .collect(
                                Collectors.groupingBy(

                                        submission ->
                                                submission
                                                        .getLanguage()
                                                        .name(),

                                        Collectors.counting()
                                )
                        );


        return languageCount.entrySet()

                .stream()

                .sorted(
                        Map.Entry
                                .<String, Long>
                                        comparingByValue()
                                .reversed()
                )

                .map(entry ->
                        new LanguageUsageResponse(

                                entry.getKey(),

                                entry.getValue()
                        )
                )

                .toList();
    }


    // =========================================================
    // RECENT SUBMISSIONS
    // =========================================================

    private List<RecentSubmissionResponse>
    getRecentSubmissions(
            List<Submission> submissions) {

        return submissions.stream()

                .filter(submission ->
                        submission.getCreatedAt() != null
                )

                .sorted(
                        Comparator.comparing(
                                Submission::getCreatedAt
                        ).reversed()
                )

                .limit(10)

                .map(submission ->
                        new RecentSubmissionResponse(

                                submission.getId(),

                                submission
                                        .getProblem()
                                        .getId(),

                                submission
                                        .getProblem()
                                        .getTitle(),

                                submission
                                        .getLanguage()
                                        .name(),

                                submission.getStatus(),

                                submission
                                        .getExecutionTimeMs(),

                                submission.getCreatedAt()
                        )
                )

                .toList();
    }



    // =========================================================
    // MAX STREAK
    // =========================================================

    private int calculateMaxStreak(
            Map<LocalDate, Long> submissionByDate) {

        if (submissionByDate.isEmpty()) {

            return 0;
        }


        List<LocalDate> dates =
                submissionByDate.keySet()

                        .stream()

                        .sorted()

                        .toList();


        int maxStreak = 1;

        int currentStreak = 1;


        for (int i = 1;
             i < dates.size();
             i++) {

            LocalDate previousDate =
                    dates.get(i - 1);

            LocalDate currentDate =
                    dates.get(i);


            if (previousDate
                    .plusDays(1)
                    .equals(currentDate)) {

                currentStreak++;

                maxStreak =
                        Math.max(
                                maxStreak,
                                currentStreak
                        );

            } else {

                currentStreak = 1;
            }
        }


        return maxStreak;
    }


    // =========================================================
    // CURRENT RANK
    // =========================================================

    private Integer getCurrentRank(
            Long userId) {

        List<LeaderboardEntry> entries =
                leaderboardRepository
                        .findAllByOrderByTotalScoreDescProblemsSolvedDesc();


        for (int i = 0;
             i < entries.size();
             i++) {

            LeaderboardEntry entry =
                    entries.get(i);


            if (entry.getUser()
                    .getId()
                    .equals(userId)) {

                return i + 1;
            }
        }


        return null;
    }


    // =========================================================
    // CURRENT USER
    // =========================================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        String email =
                authentication.getName();


        return userRepository

                .findByEmail(email)

                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }
    private List<SubmissionHeatmapResponse> getSubmissionHeatmap(
            Map<LocalDate, Long> submissionByDate) {

        LocalDate endDate = LocalDate.now();

        LocalDate startDate =
                endDate.minusDays(364);

        List<SubmissionHeatmapResponse> heatmap =
                new java.util.ArrayList<>();

        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {

            long count =
                    submissionByDate.getOrDefault(
                            currentDate,
                            0L
                    );

            heatmap.add(
                    new SubmissionHeatmapResponse(
                            currentDate,
                            count
                    )
            );

            currentDate =
                    currentDate.plusDays(1);
        }

        return heatmap;
    }
}