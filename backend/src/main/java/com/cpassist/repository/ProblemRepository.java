package com.cpassist.repository;

import com.cpassist.model.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends MongoRepository<Problem, String> {
    
    Page<Problem> findByTopic(String topic, Pageable pageable);
    
    Page<Problem> findByDifficulty(String difficulty, Pageable pageable);
    
    Page<Problem> findByTopicAndDifficulty(String topic, String difficulty, Pageable pageable);
    
    Page<Problem> findByPlatform(String platform, Pageable pageable);
    
    List<Problem> findByIdIn(List<String> ids);
    
    long countByTopic(String topic);
    
    long countByTopicAndDifficulty(String topic, String difficulty);
}
