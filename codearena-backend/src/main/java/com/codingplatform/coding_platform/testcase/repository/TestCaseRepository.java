package com.codingplatform.coding_platform.testcase.repository;

import java.util.List;

import com.codingplatform.coding_platform.testcase.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TestCaseRepository
        extends JpaRepository<TestCase, Long> {

    List<TestCase> findByProblemId(Long problemId);

    List<TestCase> findByProblemIdAndHidden(
            Long problemId,
            boolean hidden
    );
}
