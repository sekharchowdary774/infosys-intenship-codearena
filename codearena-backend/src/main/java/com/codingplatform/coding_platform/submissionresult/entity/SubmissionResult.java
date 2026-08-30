package com.codingplatform.coding_platform.submissionresult.entity;



import com.codingplatform.coding_platform.submission.entity.Submission;
import com.codingplatform.coding_platform.testcase.entity.TestCase;
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

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "submission_results")
@Getter
@Setter
public class SubmissionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // Which submission?
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;


    // Which test case?
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;


    // Result of this test case
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TestCaseStatus status;


    // Actual output produced by user code
    @Column(name = "actual_output", columnDefinition = "TEXT")
    private String actualOutput;


    // Execution time for this test case
    @Column(name = "execution_time_ms")
    private Long executionTimeMs;


    // Memory usage
    @Column(name = "memory_used_kb")
    private Long memoryUsedKb;


    // Runtime error, if any
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
