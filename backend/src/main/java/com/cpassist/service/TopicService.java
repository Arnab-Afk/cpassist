package com.cpassist.service;

import com.cpassist.exception.ResourceNotFoundException;
import com.cpassist.model.Topic;
import com.cpassist.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TopicService {
    
    @Autowired
    private TopicRepository topicRepository;
    
    public List<Topic> getAllTopics() {
        return topicRepository.findAllByOrderByOrderIndexAsc();
    }
    
    public Topic getTopicById(String id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));
    }
    
    public Topic getTopicByName(String name) {
        return topicRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with name: " + name));
    }
    
    public Topic createTopic(Topic topic) {
        return topicRepository.save(topic);
    }
    
    public Topic updateTopic(String id, Topic topicDetails) {
        Topic topic = getTopicById(id);
        
        topic.setName(topicDetails.getName());
        topic.setDisplayName(topicDetails.getDisplayName());
        topic.setDescription(topicDetails.getDescription());
        topic.setIcon(topicDetails.getIcon());
        topic.setOrderIndex(topicDetails.getOrderIndex());
        topic.setDifficultyCount(topicDetails.getDifficultyCount());
        topic.setTotalProblems(topicDetails.getTotalProblems());
        
        return topicRepository.save(topic);
    }
    
    public void deleteTopic(String id) {
        Topic topic = getTopicById(id);
        topicRepository.delete(topic);
    }
}
