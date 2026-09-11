package com.codingplatform.coding_platform.leaderboard.service;


import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.codingplatform.coding_platform.common.Role;
import com.codingplatform.coding_platform.leaderboard.dto.LeaderboardResponse;
import com.codingplatform.coding_platform.leaderboard.entity.LeaderboardEntry;
import com.codingplatform.coding_platform.leaderboard.repository.LeaderboardRepository;
import com.codingplatform.coding_platform.problem.entity.Difficulty;
import com.codingplatform.coding_platform.submission.entity.Submission;
import com.codingplatform.coding_platform.submission.entity.SubmissionStatus;
import com.codingplatform.coding_platform.submission.repository.SubmissionRepository;
import com.codingplatform.coding_platform.users.entity.User;
import com.codingplatform.coding_platform.users.repository.UserRepository;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;

    private final UserRepository userRepository;

    private final SubmissionRepository submissionRepository;



    // GET GLOBAL LEADERBOARD
    public List<LeaderboardResponse> getGlobalLeaderboard() {

        refreshLeaderboard();

        List<LeaderboardEntry> entries =
                leaderboardRepository
                        .findByUser_RoleOrderByTotalScoreDescProblemsSolvedDesc(
                                Role.USER
                        );

        return convertToResponse(entries);
    }


    // REFRESH ALL LEADERBOARD DATA
    public void refreshLeaderboard() {

        List<User> users = userRepository.findByRole(Role.USER);

        for (User user : users) {
            updateLeaderboardForUser(user);
        }
    }


    // UPDATE ONE USER
    public void updateLeaderboardForUser(User user) {

        List<Submission> allSubmissions =
                submissionRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                user.getId()
                        );


        List<Submission> acceptedSubmissions =
                submissionRepository
                        .findByUserIdAndStatus(
                                user.getId(),
                                SubmissionStatus.ACCEPTED
                        );


        // Find unique solved problems
        Set<Long> solvedProblemIds =
                acceptedSubmissions.stream()
                        .map(submission ->
                                submission.getProblem().getId()
                        )
                        .collect(
                                java.util.stream.Collectors.toSet()
                        );


        int problemsSolved =
                solvedProblemIds.size();


        // Calculate score
        int totalScore =
                calculateScore(
                        acceptedSubmissions
                );


        // Calculate acceptance rate
        double acceptanceRate =
                calculateAcceptanceRate(
                        allSubmissions.size(),
                        acceptedSubmissions.size()
                );


        // Find fastest accepted submission
        Long fastestSubmissionTime =
                acceptedSubmissions.stream()
                        .map(
                                Submission::getExecutionTimeMs
                        )
                        .filter(time -> time != null)
                        .min(Long::compareTo)
                        .orElse(null);


        LeaderboardEntry entry =
                leaderboardRepository
                        .findByUserId(user.getId())
                        .orElseGet(
                                LeaderboardEntry::new
                        );


        entry.setUser(user);

        entry.setProblemsSolved(problemsSolved);

        entry.setTotalScore(totalScore);

        entry.setAcceptanceRate(acceptanceRate);

        entry.setFastestSubmissionTimeMs(
                fastestSubmissionTime
        );


        leaderboardRepository.save(entry);
    }
    // CALCULATE DIFFICULTY SCORE
    private int calculateScore(
            List<Submission> acceptedSubmissions) {

        Map<Long, Difficulty> solvedProblems =
                new HashMap<>();


        for (Submission submission :
                acceptedSubmissions) {

            Long problemId =
                    submission.getProblem().getId();

            Difficulty difficulty =
                    submission.getProblem()
                            .getDifficulty();

            // Store only once per solved problem
            solvedProblems.putIfAbsent(
                    problemId,
                    difficulty
            );
        }


        return solvedProblems.values()
                .stream()
                .mapToInt(
                        this::getDifficultyScore
                )
                .sum();
    }


    // DIFFICULTY WEIGHTS
    private int getDifficultyScore(
            Difficulty difficulty) {

        return switch (difficulty) {

            case EASY -> 10;

            case MEDIUM -> 20;

            case HARD -> 30;
        };
    }


    // ACCEPTANCE RATE
    private double calculateAcceptanceRate(
            int totalSubmissions,
            int acceptedSubmissions) {

        if (totalSubmissions == 0) {
            return 0.0;
        }

        return (
                (double) acceptedSubmissions
                        / totalSubmissions
        ) * 100;
    }


    // ADD RANK
    private List<LeaderboardResponse> convertToResponse(
            List<LeaderboardEntry> entries) {

        return java.util.stream.IntStream
                .range(0, entries.size())
                .mapToObj(index -> {

                    LeaderboardEntry entry =
                            entries.get(index);

                    return new LeaderboardResponse(

                            index + 1,

                            entry.getUser().getId(),

                            entry.getUser().getUsername(),

                            entry.getProblemsSolved(),

                            entry.getTotalScore(),

                            Math.round(
                                    entry.getAcceptanceRate()
                                            * 100.0
                            ) / 100.0,

                            entry.getFastestSubmissionTimeMs()
                    );
                })
                .toList();
    }
}
