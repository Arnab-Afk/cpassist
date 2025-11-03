package com.cpassist.service;

import com.cpassist.exception.ResourceNotFoundException;
import com.cpassist.model.UserProgress;
import com.cpassist.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserProgressService {
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    public List<UserProgress> getUserProgress(String userId) {
        return userProgressRepository.findByUserId(userId);
    }
    
    public UserProgress getUserProgressForTopic(String userId, String topicId) {
        return userProgressRepository.findByUserIdAndTopicId(userId, topicId)
                .orElseGet(() -> {
                    UserProgress newProgress = new UserProgress();
                    newProgress.setUserId(userId);
                    newProgress.setTopicId(topicId);
                    newProgress.setEasySolved(0);
                    newProgress.setMediumSolved(0);
                    newProgress.setHardSolved(0);
                    newProgress.setTotalSolved(0);
                    newProgress.setCompletionPercentage(0.0);
                    return userProgressRepository.save(newProgress);
                });
    }
    
    public UserProgress updateProgress(String userId, String topicId, UserProgress progressDetails) {
        UserProgress progress = getUserProgressForTopic(userId, topicId);
        
        progress.setEasySolved(progressDetails.getEasySolved());
        progress.setMediumSolved(progressDetails.getMediumSolved());
        progress.setHardSolved(progressDetails.getHardSolved());
        progress.setTotalSolved(progressDetails.getTotalSolved());
        progress.setTotalProblems(progressDetails.getTotalProblems());
        progress.setTopicName(progressDetails.getTopicName());
        
        // Calculate completion percentage
        if (progress.getTotalProblems() > 0) {
            double percentage = (progress.getTotalSolved() * 100.0) / progress.getTotalProblems();
            progress.setCompletionPercentage(Math.round(percentage * 100.0) / 100.0);
        }
        
        return userProgressRepository.save(progress);
    }
    
    public void deleteUserProgress(String userId) {
        userProgressRepository.deleteByUserId(userId);
    }
}
