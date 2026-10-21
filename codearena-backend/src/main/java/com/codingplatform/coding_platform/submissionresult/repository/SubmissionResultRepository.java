package com.codingplatform.coding_platform.submissionresult.repository;

import java.util.List;

import com.codingplatform.coding_platform.submissionresult.entity.SubmissionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SubmissionResultRepository
        extends JpaRepository<SubmissionResult, Long> {

    List<SubmissionResult> findBySubmissionIdOrderByIdAsc(
            Long submissionId
    );

    void deleteBySubmissionId(Long submissionId);
}