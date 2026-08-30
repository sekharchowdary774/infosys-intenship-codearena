package com.codingplatform.coding_platform.leaderboard.entity;



import com.codingplatform.coding_platform.users.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "leaderboard_entries")
@Getter
@Setter
public class LeaderboardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;


    @Column(nullable = false)
    private Integer problemsSolved = 0;


    @Column(nullable = false)
    private Integer totalScore = 0;


    @Column(nullable = false)
    private Double acceptanceRate = 0.0;


    @Column
    private Long fastestSubmissionTimeMs;
}
