package com.cpassist.controller;

import com.cpassist.dto.MessageResponse;
import com.cpassist.model.Problem;
import com.cpassist.model.Submission;
import com.cpassist.model.User;
import com.cpassist.repository.ProblemRepository;
import com.cpassist.repository.SubmissionRepository;
import com.cpassist.repository.UserRepository;
import com.cpassist.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/submissions")
public class ExternalSubmissionController {
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private UserService userService;
    
    /**
     * Endpoint for browser extension to submit external platform solutions
     * This receives submissions from LeetCode, Codeforces, CodeChef via extension
     */
    @PostMapping("/external")
    public ResponseEntity<?> createExternalSubmission(@RequestBody Map<String, Object> submissionData) {
        String userId = getCurrentUserId();
        
        try {
            // Extract submission data
            String problemTitle = (String) submissionData.get("problemTitle");
            String problemUrl = (String) submissionData.get("problemUrl");
            String difficulty = (String) submissionData.get("difficulty");
            String platform = (String) submissionData.get("platform");
            String code = (String) submissionData.get("code");
            String language = (String) submissionData.get("language");
            String status = (String) submissionData.get("status");
            Integer runtime = submissionData.get("runtime") != null ? 
                            ((Number) submissionData.get("runtime")).intValue() : null;
            Double memory = submissionData.get("memory") != null ? 
                           ((Number) submissionData.get("memory")).doubleValue() : null;
            
            // Find or create problem
            Problem problem = findOrCreateProblem(problemTitle, problemUrl, difficulty, platform);
            
            // Check if user already solved this problem
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean isFirstSolve = !user.getSolvedProblems().contains(problem.getId());
            
            // Create submission
            Submission submission = new Submission();
            submission.setUserId(userId);
            submission.setProblemId(problem.getId());
            submission.setCode(code);
            submission.setLanguage(language);
            submission.setStatus(status);
            submission.setRuntime(runtime);
            submission.setMemory(memory != null ? memory.intValue() : null);
            submission.setNotes("Synced from " + platform + " via browser extension");
            submission.setSubmittedAt(LocalDateTime.now());
            
            Submission savedSubmission = submissionRepository.save(submission);
            
            // Mark problem as solved if accepted and first time
            if ("ACCEPTED".equals(status) && isFirstSolve) {
                userService.markProblemAsSolved(userId, problem.getId());
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Submission synced successfully",
                "submissionId", savedSubmission.getId(),
                "problemId", problem.getId(),
                "isFirstSolve", isFirstSolve
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new MessageResponse("Failed to sync submission: " + e.getMessage()));
        }
    }
    
    /**
     * Find existing problem or create new one
     */
    private Problem findOrCreateProblem(String title, String url, String difficulty, String platform) {
        // Try to find by title first
        Optional<Problem> existingProblem = problemRepository.findByTitleIgnoreCase(title);
        
        if (existingProblem.isPresent()) {
            return existingProblem.get();
        }
        
        // Create new problem
        Problem problem = new Problem();
        problem.setTitle(title);
        problem.setPlatformUrl(url);
        problem.setDifficulty(difficulty != null ? difficulty.toUpperCase() : "MEDIUM");
        problem.setPlatform(platform != null ? platform.toUpperCase() : "LEETCODE");
        problem.setDescription("Synced from " + platform);
        problem.setTopic("GENERAL"); // Default topic
        problem.setCreatedAt(LocalDateTime.now());
        problem.setUpdatedAt(LocalDateTime.now());
        
        return problemRepository.save(problem);
    }
    
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
