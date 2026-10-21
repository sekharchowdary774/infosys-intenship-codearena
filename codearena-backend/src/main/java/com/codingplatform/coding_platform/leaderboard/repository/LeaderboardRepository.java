package com.codingplatform.coding_platform.leaderboard.repository;

import java.util.List;
import java.util.Optional;

import com.codingplatform.coding_platform.common.Role;
import com.codingplatform.coding_platform.leaderboard.entity.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeaderboardRepository
        extends JpaRepository<LeaderboardEntry, Long> {

    Optional<LeaderboardEntry> findByUserId(Long userId);

    List<LeaderboardEntry> findByUser_RoleOrderByTotalScoreDescProblemsSolvedDesc(
            Role role
    );
}