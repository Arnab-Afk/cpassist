package com.cpassist.service;

import com.cpassist.model.Problem;
import com.cpassist.model.Submission;
import com.cpassist.model.User;
import com.cpassist.repository.ProblemRepository;
import com.cpassist.repository.SubmissionRepository;
import com.cpassist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service to sync user progress from external platforms like LeetCode
 * 
 * Note: LeetCode doesn't have an official public API, so this uses:
 * 1. LeetCode GraphQL endpoint (unofficial)
 * 2. Public profile scraping
 * 
 * Limitations:
 * - May break if LeetCode changes their API
 * - Rate limiting may apply
 * - Only syncs accepted solutions
 */
@Service
public class LeetCodeSyncService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private UserService userService;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    // LeetCode GraphQL endpoint (unofficial)
    private static final String LEETCODE_GRAPHQL = "https://leetcode.com/graphql";
    
    /**
     * Syncs a user's LeetCode progress with CPAssist
     * @param userId CPAssist user ID
     * @param leetcodeUsername LeetCode username
     * @return Number of new problems synced
     */
    public int syncUserProgress(String userId, String leetcodeUsername) {
        // Fetch user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get solved problems from LeetCode
        Set<String> leetcodeSolved = fetchSolvedProblems(leetcodeUsername);
        
        // Match with problems in our database
        int syncedCount = 0;
        for (String problemTitle : leetcodeSolved) {
            Optional<Problem> problemOpt = problemRepository.findByTitleIgnoreCase(problemTitle);
            
            if (problemOpt.isPresent()) {
                Problem problem = problemOpt.get();
                
                // Check if user already solved this
                if (!user.getSolvedProblems().contains(problem.getId())) {
                    // Mark as solved
                    userService.markProblemAsSolved(userId, problem.getId());
                    
                    // Create a submission record
                    Submission submission = new Submission();
                    submission.setUserId(userId);
                    submission.setProblemId(problem.getId());
                    submission.setStatus("ACCEPTED");
                    submission.setLanguage("unknown"); // We don't know from sync
                    submission.setSubmittedAt(LocalDateTime.now());
                    submission.setNotes("Synced from LeetCode");
                    submissionRepository.save(submission);
                    
                    syncedCount++;
                }
            }
        }
        
        return syncedCount;
    }
    
    /**
     * Fetches solved problems from LeetCode using GraphQL
     * Note: This is an unofficial API and may break
     */
    private Set<String> fetchSolvedProblems(String username) {
        try {
            // GraphQL query to get solved problems
            String query = String.format(
                "{\"query\": \"query { matchedUser(username: \\\"%s\\\") { " +
                "submitStats { acSubmissionNum { difficulty count } } " +
                "problemsSolvedBeatsStats { difficulty percentage } } }\"}", 
                username
            );
            
            // TODO: Implement actual HTTP request to LeetCode GraphQL
            // For now, return empty set as placeholder
            // You would need to:
            // 1. Send POST request to LEETCODE_GRAPHQL
            // 2. Parse JSON response
            // 3. Extract problem titles
            // 4. Return set of titles
            
            System.out.println("LeetCode sync for user: " + username);
            System.out.println("Note: LeetCode API integration needs to be implemented");
            System.out.println("Consider using a browser extension instead for real-time sync");
            
            return new HashSet<>();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch from LeetCode: " + e.getMessage());
        }
    }
    
    /**
     * Alternative: Sync using browser extension data
     * This would be called from the browser extension
     */
    public int syncFromExtension(String userId, List<Map<String, Object>> solvedProblems) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        int syncedCount = 0;
        
        for (Map<String, Object> problemData : solvedProblems) {
            String problemTitle = (String) problemData.get("title");
            String difficulty = (String) problemData.get("difficulty");
            
            Optional<Problem> problemOpt = problemRepository.findByTitleIgnoreCase(problemTitle);
            
            if (problemOpt.isPresent()) {
                Problem problem = problemOpt.get();
                
                if (!user.getSolvedProblems().contains(problem.getId())) {
                    userService.markProblemAsSolved(userId, problem.getId());
                    
                    Submission submission = new Submission();
                    submission.setUserId(userId);
                    submission.setProblemId(problem.getId());
                    submission.setStatus("ACCEPTED");
                    submission.setLanguage((String) problemData.getOrDefault("language", "unknown"));
                    submission.setSubmittedAt(LocalDateTime.now());
                    submission.setNotes("Synced from LeetCode via extension");
                    submissionRepository.save(submission);
                    
                    syncedCount++;
                }
            }
        }
        
        return syncedCount;
    }
}
