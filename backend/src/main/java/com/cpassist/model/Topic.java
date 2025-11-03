package com.cpassist.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "topics")
public class Topic {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String name;
    
    private String displayName;
    
    private String description;
    
    private String icon;
    
    private int orderIndex;
    
    private Map<String, Integer> difficultyCount = new HashMap<>(); // EASY, MEDIUM, HARD counts
    
    private int totalProblems;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public Topic() {
    }
    
    public Topic(String id, String name, String displayName, String description, String icon,
                 int orderIndex, Map<String, Integer> difficultyCount, int totalProblems,
                 LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.description = description;
        this.icon = icon;
        this.orderIndex = orderIndex;
        this.difficultyCount = difficultyCount;
        this.totalProblems = totalProblems;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIcon() {
        return icon;
    }
    
    public void setIcon(String icon) {
        this.icon = icon;
    }
    
    public int getOrderIndex() {
        return orderIndex;
    }
    
    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }
    
    public Map<String, Integer> getDifficultyCount() {
        return difficultyCount;
    }
    
    public void setDifficultyCount(Map<String, Integer> difficultyCount) {
        this.difficultyCount = difficultyCount;
    }
    
    public int getTotalProblems() {
        return totalProblems;
    }
    
    public void setTotalProblems(int totalProblems) {
        this.totalProblems = totalProblems;
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
