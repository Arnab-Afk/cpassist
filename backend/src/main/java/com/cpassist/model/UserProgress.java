package com.cpassist.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "user_progress")
public class UserProgress {
    
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String topicId;
    
    private String topicName;
    
    private int easySolved;
    
    private int mediumSolved;
    
    private int hardSolved;
    
    private int totalSolved;
    
    private int totalProblems;
    
    private double completionPercentage;
    
    private Map<String, LocalDateTime> problemSolvedDates = new HashMap<>();
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public UserProgress() {
    }
    
    public UserProgress(String id, String userId, String topicId, String topicName,
                        int easySolved, int mediumSolved, int hardSolved, int totalSolved,
                        int totalProblems, double completionPercentage,
                        Map<String, LocalDateTime> problemSolvedDates,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.topicId = topicId;
        this.topicName = topicName;
        this.easySolved = easySolved;
        this.mediumSolved = mediumSolved;
        this.hardSolved = hardSolved;
        this.totalSolved = totalSolved;
        this.totalProblems = totalProblems;
        this.completionPercentage = completionPercentage;
        this.problemSolvedDates = problemSolvedDates;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getTopicId() {
        return topicId;
    }
    
    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }
    
    public String getTopicName() {
        return topicName;
    }
    
    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }
    
    public int getEasySolved() {
        return easySolved;
    }
    
    public void setEasySolved(int easySolved) {
        this.easySolved = easySolved;
    }
    
    public int getMediumSolved() {
        return mediumSolved;
    }
    
    public void setMediumSolved(int mediumSolved) {
        this.mediumSolved = mediumSolved;
    }
    
    public int getHardSolved() {
        return hardSolved;
    }
    
    public void setHardSolved(int hardSolved) {
        this.hardSolved = hardSolved;
    }
    
    public int getTotalSolved() {
        return totalSolved;
    }
    
    public void setTotalSolved(int totalSolved) {
        this.totalSolved = totalSolved;
    }
    
    public int getTotalProblems() {
        return totalProblems;
    }
    
    public void setTotalProblems(int totalProblems) {
        this.totalProblems = totalProblems;
    }
    
    public double getCompletionPercentage() {
        return completionPercentage;
    }
    
    public void setCompletionPercentage(double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }
    
    public Map<String, LocalDateTime> getProblemSolvedDates() {
        return problemSolvedDates;
    }
    
    public void setProblemSolvedDates(Map<String, LocalDateTime> problemSolvedDates) {
        this.problemSolvedDates = problemSolvedDates;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
