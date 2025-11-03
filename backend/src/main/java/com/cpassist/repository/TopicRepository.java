package com.cpassist.repository;

import com.cpassist.model.Topic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends MongoRepository<Topic, String> {
    
    Optional<Topic> findByName(String name);
    
    List<Topic> findAllByOrderByOrderIndexAsc();
    
    Boolean existsByName(String name);
}
