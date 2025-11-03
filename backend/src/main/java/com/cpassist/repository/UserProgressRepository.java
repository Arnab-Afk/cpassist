package com.cpassist.repository;

import com.cpassist.model.UserProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends MongoRepository<UserProgress, String> {
    
    List<UserProgress> findByUserId(String userId);
    
    Optional<UserProgress> findByUserIdAndTopicId(String userId, String topicId);
    
    void deleteByUserId(String userId);
}
