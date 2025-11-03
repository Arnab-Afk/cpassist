package com.cpassist.controller;

import com.cpassist.model.UserProgress;
import com.cpassist.service.UserProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/progress")
public class UserProgressController {
    
    @Autowired
    private UserProgressService userProgressService;
    
    @GetMapping
    public ResponseEntity<List<UserProgress>> getUserProgress() {
        String userId = getCurrentUserId();
        List<UserProgress> progress = userProgressService.getUserProgress(userId);
        return ResponseEntity.ok(progress);
    }
    
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<UserProgress> getUserProgressForTopic(@PathVariable String topicId) {
        String userId = getCurrentUserId();
        UserProgress progress = userProgressService.getUserProgressForTopic(userId, topicId);
        return ResponseEntity.ok(progress);
    }
    
    @PutMapping("/topic/{topicId}")
    public ResponseEntity<UserProgress> updateProgress(
            @PathVariable String topicId, 
            @RequestBody UserProgress progressDetails) {
        String userId = getCurrentUserId();
        UserProgress progress = userProgressService.updateProgress(userId, topicId, progressDetails);
        return ResponseEntity.ok(progress);
    }
    
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // In a real application, you would get the user ID from the authentication
        // For now, we'll use the username as the user ID
        return authentication.getName();
    }
}
