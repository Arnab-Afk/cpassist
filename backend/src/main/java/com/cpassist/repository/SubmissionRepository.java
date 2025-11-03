package com.cpassist.repository;

import com.cpassist.model.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    
    Page<Submission> findByUserId(String userId, Pageable pageable);
    
    Page<Submission> findByProblemId(String problemId, Pageable pageable);
    
    List<Submission> findByUserIdAndProblemId(String userId, String problemId);
    
    List<Submission> findByUserIdAndStatus(String userId, String status);
    
    long countByUserIdAndStatus(String userId, String status);
}
