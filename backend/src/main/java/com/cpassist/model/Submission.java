package com.cpassist.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "submissions")
public class Submission {
    
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String problemId;
    
    private String code;
    
    private String language;
    
    private String status; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, etc.
    
    private Integer runtime;
    
    private Integer memory;
    
    private String notes;
    
    @CreatedDate
    private LocalDateTime submittedAt;
    
    public Submission() {
    }
    
    public Submission(String id, String userId, String problemId, String code, String language,
                      String status, Integer runtime, Integer memory, String notes,
                      LocalDateTime submittedAt) {
        this.id = id;
        this.userId = userId;
        this.problemId = problemId;
        this.code = code;
        this.language = language;
        this.status = status;
        this.runtime = runtime;
        this.memory = memory;
        this.notes = notes;
        this.submittedAt = submittedAt;
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
    
    public String getProblemId() {
        return problemId;
    }
    
    public void setProblemId(String problemId) {
        this.problemId = problemId;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Integer getRuntime() {
        return runtime;
    }
    
    public void setRuntime(Integer runtime) {
        this.runtime = runtime;
    }
    
    public Integer getMemory() {
        return memory;
    }
    
    public void setMemory(Integer memory) {
        this.memory = memory;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
