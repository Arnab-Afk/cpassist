package com.cpassist.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "problems")
public class Problem {
    
    @Id
    private String id;
    
    @Indexed
    private String title;
    
    private String description;
    
    @Indexed
    private String difficulty; // EASY, MEDIUM, HARD
    
    @Indexed
    private String topic; // ARRAY, LINKED_LIST, TREE, GRAPH, DP, etc.
    
    private List<String> tags = new ArrayList<>();
    
    private String platform; // LEETCODE, CODEFORCES, CODECHEF, HACKERRANK
    
    private String platformUrl;
    
    private String problemNumber;
    
    private List<TestCase> testCases = new ArrayList<>();
    
    private Constraints constraints;
    
    private int acceptanceRate;
    
    private int totalSubmissions;
    
    private int totalAccepted;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public Problem() {
    }
    
    public Problem(String id, String title, String description, String difficulty, String topic,
                   List<String> tags, String platform, String platformUrl, String problemNumber,
                   List<TestCase> testCases, Constraints constraints, int acceptanceRate,
                   int totalSubmissions, int totalAccepted, LocalDateTime createdAt,
                   LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.topic = topic;
        this.tags = tags;
        this.platform = platform;
        this.platformUrl = platformUrl;
        this.problemNumber = problemNumber;
        this.testCases = testCases;
        this.constraints = constraints;
        this.acceptanceRate = acceptanceRate;
        this.totalSubmissions = totalSubmissions;
        this.totalAccepted = totalAccepted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getDifficulty() {
        return difficulty;
    }
    
    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
    
    public String getTopic() {
        return topic;
    }
    
    public void setTopic(String topic) {
        this.topic = topic;
    }
    
    public List<String> getTags() {
        return tags;
    }
    
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
    
    public String getPlatform() {
        return platform;
    }
    
    public void setPlatform(String platform) {
        this.platform = platform;
    }
    
    public String getPlatformUrl() {
        return platformUrl;
    }
    
    public void setPlatformUrl(String platformUrl) {
        this.platformUrl = platformUrl;
    }
    
    public String getProblemNumber() {
        return problemNumber;
    }
    
    public void setProblemNumber(String problemNumber) {
        this.problemNumber = problemNumber;
    }
    
    public List<TestCase> getTestCases() {
        return testCases;
    }
    
    public void setTestCases(List<TestCase> testCases) {
        this.testCases = testCases;
    }
    
    public Constraints getConstraints() {
        return constraints;
    }
    
    public void setConstraints(Constraints constraints) {
        this.constraints = constraints;
    }
    
    public int getAcceptanceRate() {
        return acceptanceRate;
    }
    
    public void setAcceptanceRate(int acceptanceRate) {
        this.acceptanceRate = acceptanceRate;
    }
    
    public int getTotalSubmissions() {
        return totalSubmissions;
    }
    
    public void setTotalSubmissions(int totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }
    
    public int getTotalAccepted() {
        return totalAccepted;
    }
    
    public void setTotalAccepted(int totalAccepted) {
        this.totalAccepted = totalAccepted;
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
    
    public static class TestCase {
        private String input;
        private String expectedOutput;
        private String explanation;
        
        public TestCase() {
        }
        
        public TestCase(String input, String expectedOutput, String explanation) {
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.explanation = explanation;
        }
        
        public String getInput() {
            return input;
        }
        
        public void setInput(String input) {
            this.input = input;
        }
        
        public String getExpectedOutput() {
            return expectedOutput;
        }
        
        public void setExpectedOutput(String expectedOutput) {
            this.expectedOutput = expectedOutput;
        }
        
        public String getExplanation() {
            return explanation;
        }
        
        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }
    
    public static class Constraints {
        private String timeLimit;
        private String memoryLimit;
        private List<String> inputConstraints = new ArrayList<>();
        
        public Constraints() {
        }
        
        public Constraints(String timeLimit, String memoryLimit, List<String> inputConstraints) {
            this.timeLimit = timeLimit;
            this.memoryLimit = memoryLimit;
            this.inputConstraints = inputConstraints;
        }
        
        public String getTimeLimit() {
            return timeLimit;
        }
        
        public void setTimeLimit(String timeLimit) {
            this.timeLimit = timeLimit;
        }
        
        public String getMemoryLimit() {
            return memoryLimit;
        }
        
        public void setMemoryLimit(String memoryLimit) {
            this.memoryLimit = memoryLimit;
        }
        
        public List<String> getInputConstraints() {
            return inputConstraints;
        }
        
        public void setInputConstraints(List<String> inputConstraints) {
            this.inputConstraints = inputConstraints;
        }
    }
}
