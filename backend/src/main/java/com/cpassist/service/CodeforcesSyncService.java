package com.cpassist.service;

import com.cpassist.model.Problem;
import com.cpassist.model.Submission;
import com.cpassist.model.User;
import com.cpassist.repository.ProblemRepository;
import com.cpassist.repository.SubmissionRepository;
import com.cpassist.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
public class CodeforcesSyncService {

    private static final Logger logger = LoggerFactory.getLogger(CodeforcesSyncService.class);
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final String CODEFORCES_API_BASE = "https://codeforces.com/api";
    
    /**
     * Sync user's accepted submissions from Codeforces
     * API: https://codeforces.com/api/user.status?handle={handle}&from=1&count={count}
     */
    public Map<String, Object> syncUserSubmissions(String usernameOrId, String codeforcesHandle) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Find user - try by ID first, then by username
            User user = userRepository.findById(usernameOrId)
                .or(() -> userRepository.findByUsername(usernameOrId))
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            logger.info("Starting Codeforces sync for user: {} with handle: {}", user.getUsername(), codeforcesHandle);
            
            // Fetch user's submissions from Codeforces API
            String apiUrl = String.format("%s/user.status?handle=%s&from=1&count=1000", 
                CODEFORCES_API_BASE, codeforcesHandle);
            
            String response;
            try {
                response = restTemplate.getForObject(apiUrl, String.class);
            } catch (Exception e) {
                logger.error("Failed to call Codeforces API", e);
                throw new RuntimeException("Unable to reach Codeforces API. Please check your internet connection.");
            }
            
            JsonNode root = objectMapper.readTree(response);
            
            // Check if API call was successful
            String status = root.path("status").asText();
            if (!"OK".equals(status)) {
                String comment = root.path("comment").asText();
                logger.error("Codeforces API error: {}", comment);
                
                // Provide user-friendly error messages
                if (comment.contains("not found")) {
                    throw new RuntimeException("Codeforces handle '" + codeforcesHandle + "' not found. Please check your username and try again.");
                } else if (comment.contains("Call limit exceeded")) {
                    throw new RuntimeException("Codeforces API rate limit exceeded. Please try again in a few minutes.");
                } else {
                    throw new RuntimeException("Codeforces API error: " + comment);
                }
            }
            
            JsonNode submissions = root.path("result");
            
            int totalSubmissions = 0;
            int acceptedSubmissions = 0;
            Set<String> solvedProblemIds = new HashSet<>();
            
            // Process each submission
            for (JsonNode submissionNode : submissions) {
                totalSubmissions++;
                
                // Only process accepted submissions (verdict == "OK")
                String verdict = submissionNode.path("verdict").asText();
                if (!"OK".equals(verdict)) {
                    continue;
                }
                
                acceptedSubmissions++;
                
                // Extract problem details
                JsonNode problemNode = submissionNode.path("problem");
                String contestId = problemNode.path("contestId").asText();
                String index = problemNode.path("index").asText();
                String problemName = problemNode.path("name").asText();
                String difficulty = problemNode.path("rating").asText("0");
                
                // Extract submission details
                String programmingLanguage = submissionNode.path("programmingLanguage").asText();
                long timeConsumedMillis = submissionNode.path("timeConsumedMillis").asLong();
                long memoryConsumedBytes = submissionNode.path("memoryConsumedBytes").asLong();
                long creationTimeSeconds = submissionNode.path("creationTimeSeconds").asLong();
                
                // Create or update problem
                String problemId = "CF-" + contestId + index;
                String problemUrl = String.format("https://codeforces.com/problemset/problem/%s/%s", 
                    contestId, index);
                
                Optional<Problem> existingProblem = problemRepository.findById(problemId);
                Problem problem;
                
                if (existingProblem.isPresent()) {
                    problem = existingProblem.get();
                } else {
                    problem = new Problem();
                    problem.setId(problemId);
                    problem.setTitle(problemName);
                    problem.setDescription("Codeforces problem: " + problemName);
                    problem.setDifficulty(mapDifficultyRatingToDifficulty(difficulty));
                    problem.setTopic(extractTopicFromTags(problemNode));
                    problem.setTags(extractTags(problemNode));
                    problem.setPlatform("CODEFORCES");
                    problem.setPlatformUrl(problemUrl);
                    problem.setProblemNumber(contestId + index);
                    problem.setCreatedAt(LocalDateTime.now());
                    problem.setUpdatedAt(LocalDateTime.now());
                    
                    problem = problemRepository.save(problem);
                    logger.info("Created new problem: {} - {}", problemId, problemName);
                }
                
                solvedProblemIds.add(problemId);
                
                // Check if submission already exists for this user and problem
                List<Submission> existingSubmissions = submissionRepository
                    .findByUserIdAndProblemId(user.getId(), problemId);
                
                // If no submissions exist for this problem, create one
                if (existingSubmissions.isEmpty()) {
                    // Create new submission
                    Submission submission = new Submission();
                    submission.setUserId(user.getId());
                    submission.setProblemId(problemId);
                    submission.setCode("// Synced from Codeforces - code not available");
                    submission.setLanguage(mapCodeforcesLanguage(programmingLanguage));
                    submission.setStatus("ACCEPTED");
                    submission.setRuntime((int) timeConsumedMillis);
                    submission.setMemory((int) (memoryConsumedBytes / 1024)); // Convert to KB
                    submission.setNotes("Synced from Codeforces");
                    submission.setSubmittedAt(
                        LocalDateTime.ofInstant(Instant.ofEpochSecond(creationTimeSeconds), ZoneId.systemDefault())
                    );
                    
                    submissionRepository.save(submission);
                    logger.debug("Created submission for problem: {}", problemId);
                }
            }
            
            // Update user's solved problems
            if (!solvedProblemIds.isEmpty()) {
                Set<String> currentSolved = new HashSet<>(user.getSolvedProblems());
                currentSolved.addAll(solvedProblemIds);
                user.setSolvedProblems(currentSolved);
                userRepository.save(user);
                logger.info("Updated user solved problems. Total solved: {}", currentSolved.size());
            }
            
            result.put("success", true);
            result.put("message", String.format("Successfully synced %d accepted problems from Codeforces", 
                solvedProblemIds.size()));
            result.put("totalSubmissions", totalSubmissions);
            result.put("acceptedSubmissions", acceptedSubmissions);
            result.put("problemsSynced", solvedProblemIds.size());
            result.put("codeforcesHandle", codeforcesHandle);
            
        } catch (Exception e) {
            logger.error("Error syncing Codeforces submissions", e);
            result.put("success", false);
            result.put("message", "Failed to sync: " + e.getMessage());
            throw new RuntimeException("Failed to sync Codeforces data: " + e.getMessage(), e);
        }
        
        return result;
    }
    
    /**
     * Map Codeforces rating to our difficulty levels
     */
    private String mapDifficultyRatingToDifficulty(String rating) {
        try {
            int ratingValue = Integer.parseInt(rating);
            if (ratingValue < 1200) return "EASY";
            if (ratingValue < 1800) return "MEDIUM";
            return "HARD";
        } catch (NumberFormatException e) {
            return "MEDIUM"; // Default
        }
    }
    
    /**
     * Extract main topic from problem tags
     */
    private String extractTopicFromTags(JsonNode problemNode) {
        JsonNode tagsNode = problemNode.path("tags");
        if (tagsNode.isArray() && tagsNode.size() > 0) {
            return tagsNode.get(0).asText().toUpperCase().replace(" ", "_");
        }
        return "GENERAL";
    }
    
    /**
     * Extract all tags from problem
     */
    private List<String> extractTags(JsonNode problemNode) {
        List<String> tags = new ArrayList<>();
        JsonNode tagsNode = problemNode.path("tags");
        if (tagsNode.isArray()) {
            for (JsonNode tag : tagsNode) {
                tags.add(tag.asText());
            }
        }
        return tags;
    }
    
    /**
     * Map Codeforces programming language to our standard format
     */
    private String mapCodeforcesLanguage(String cfLang) {
        String lower = cfLang.toLowerCase();
        if (lower.contains("c++")) return "cpp";
        if (lower.contains("java")) return "java";
        if (lower.contains("python")) return "python";
        if (lower.contains("c#")) return "csharp";
        if (lower.contains("javascript")) return "javascript";
        if (lower.contains("kotlin")) return "kotlin";
        if (lower.contains("rust")) return "rust";
        if (lower.contains("go")) return "go";
        return "other";
    }
}
