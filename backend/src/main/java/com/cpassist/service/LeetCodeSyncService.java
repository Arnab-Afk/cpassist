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
     * @param usernameOrId CPAssist username or ID
     * @param leetcodeUsername LeetCode username
     * @return Number of new problems synced
     */
    public int syncUserProgress(String usernameOrId, String leetcodeUsername) {
        // Fetch user - try by ID first, then by username
        User user = userRepository.findById(usernameOrId)
            .or(() -> userRepository.findByUsername(usernameOrId))
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get solved problems from LeetCode with their details
        Map<String, Map<String, String>> leetcodeSolved = fetchSolvedProblemsWithDetails(leetcodeUsername);
        
        System.out.println("Fetched " + leetcodeSolved.size() + " solved problems from LeetCode for user: " + leetcodeUsername);
        
        // Match with problems in our database or create new ones
        int syncedCount = 0;
        for (Map.Entry<String, Map<String, String>> entry : leetcodeSolved.entrySet()) {
            String problemTitle = entry.getKey();
            Map<String, String> problemDetails = entry.getValue();
            String titleSlug = problemDetails.get("titleSlug");
            
            Optional<Problem> problemOpt = problemRepository.findByTitleIgnoreCase(problemTitle);
            Problem problem;
            
            if (problemOpt.isPresent()) {
                problem = problemOpt.get();
                System.out.println("Found existing problem: " + problemTitle);
            } else {
                // Create new problem if it doesn't exist
                problem = new Problem();
                problem.setId("LC-" + titleSlug);
                problem.setTitle(problemTitle);
                problem.setDescription("LeetCode problem: " + problemTitle);
                problem.setDifficulty("MEDIUM"); // Default, can be updated later
                problem.setTopic("GENERAL");
                problem.setPlatform("LEETCODE");
                problem.setPlatformUrl("https://leetcode.com/problems/" + titleSlug + "/");
                problem.setProblemNumber(titleSlug);
                problem.setCreatedAt(LocalDateTime.now());
                problem.setUpdatedAt(LocalDateTime.now());
                problem = problemRepository.save(problem);
                System.out.println("Created new problem: " + problemTitle + " with ID: " + problem.getId());
            }
            
            // Check if user already solved this
            if (!user.getSolvedProblems().contains(problem.getId())) {
                // Add to user's solved problems directly
                user.getSolvedProblems().add(problem.getId());
                user.getAttemptedProblems().add(problem.getId());
                
                // Create a submission record
                Submission submission = new Submission();
                submission.setUserId(user.getId());
                submission.setProblemId(problem.getId());
                submission.setStatus("ACCEPTED");
                submission.setLanguage("unknown"); // We don't know from sync
                submission.setSubmittedAt(LocalDateTime.now());
                submission.setNotes("Synced from LeetCode");
                submissionRepository.save(submission);
                
                syncedCount++;
                System.out.println("Marked problem as solved: " + problemTitle + " for user: " + user.getUsername());
            } else {
                System.out.println("User already solved: " + problemTitle);
            }
        }
        
        // Save user with updated solved problems
        if (syncedCount > 0) {
            userRepository.save(user);
            System.out.println("Saved user with " + syncedCount + " newly synced problems");
        }
        
        return syncedCount;
    }
    
    /**
     * Fetches solved problems from LeetCode using GraphQL with details
     * Uses the recentAcSubmissionList query to get accepted submissions
     * Returns a map of problem title to problem details (titleSlug, timestamp)
     */
    private Map<String, Map<String, String>> fetchSolvedProblemsWithDetails(String username) {
        Map<String, Map<String, String>> solvedProblems = new HashMap<>();
        
        try {
            // GraphQL query to get recent accepted submissions (limit 100 most recent)
            String query = "query recentAcSubmissions($username: String!) { " +
                "recentAcSubmissionList(username: $username, limit: 100) { " +
                "title titleSlug timestamp } }";
            
            // Build GraphQL request
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            requestBody.put("variables", Map.of("username", username));
            
            // Set headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.set("Referer", "https://leetcode.com");
            
            org.springframework.http.HttpEntity<Map<String, Object>> entity = 
                new org.springframework.http.HttpEntity<>(requestBody, headers);
            
            // Make the request
            org.springframework.http.ResponseEntity<String> response = 
                restTemplate.exchange(
                    LEETCODE_GRAPHQL,
                    org.springframework.http.HttpMethod.POST,
                    entity,
                    String.class
                );
            
            // Parse response
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response.getBody());
            
            // Check for errors
            if (root.has("errors")) {
                String errorMsg = root.get("errors").toString();
                throw new RuntimeException("LeetCode API error: " + errorMsg);
            }
            
            // Extract solved problems
            com.fasterxml.jackson.databind.JsonNode submissions = 
                root.path("data").path("recentAcSubmissionList");
            
            if (submissions.isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode submission : submissions) {
                    String title = submission.path("title").asText();
                    String titleSlug = submission.path("titleSlug").asText();
                    String timestamp = submission.path("timestamp").asText();
                    
                    if (!title.isEmpty() && !titleSlug.isEmpty()) {
                        Map<String, String> details = new HashMap<>();
                        details.put("titleSlug", titleSlug);
                        details.put("timestamp", timestamp);
                        solvedProblems.put(title, details);
                    }
                }
            }
            
            System.out.println("LeetCode sync for user: " + username + " - Found " + solvedProblems.size() + " problems");
            
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("LeetCode user '" + username + "' not found. Please check your username and try again.");
            } else {
                throw new RuntimeException("Failed to fetch from LeetCode: " + e.getMessage());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch from LeetCode: " + e.getMessage());
        }
        
        return solvedProblems;
    }
    
    /**
     * Alternative: Sync using browser extension data
     * This would be called from the browser extension
     */
    public int syncFromExtension(String usernameOrId, List<Map<String, Object>> solvedProblems) {
        User user = userRepository.findById(usernameOrId)
            .or(() -> userRepository.findByUsername(usernameOrId))
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        int syncedCount = 0;
        
        for (Map<String, Object> problemData : solvedProblems) {
            String problemTitle = (String) problemData.get("title");
            
            Optional<Problem> problemOpt = problemRepository.findByTitleIgnoreCase(problemTitle);
            
            if (problemOpt.isPresent()) {
                Problem problem = problemOpt.get();
                
                if (!user.getSolvedProblems().contains(problem.getId())) {
                    userService.markProblemAsSolved(user.getUsername(), problem.getId());
                    
                    Submission submission = new Submission();
                    submission.setUserId(user.getId());
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
