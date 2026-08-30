package com.codingplatform.coding_platform.submission.entity;


import com.codingplatform.coding_platform.common.BaseEntity;
import com.codingplatform.coding_platform.problem.entity.Problem;
import com.codingplatform.coding_platform.users.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "submissions")
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class Submission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // Which user submitted the code?
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    // Which problem was solved?
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;


    // Which programming language?
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProgrammingLanguage language;


    // User's actual source code
    @Column(nullable = false, columnDefinition = "TEXT")
    private String sourceCode;


    // Current result
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SubmissionStatus status;


    // Total execution time
    @Column(name = "execution_time_ms")
    private Long executionTimeMs;


    // Memory used
    @Column(name = "memory_used_kb")
    private Long memoryUsedKb;


    // Compiler/runtime error message
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
