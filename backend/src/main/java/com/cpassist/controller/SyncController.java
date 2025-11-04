package com.cpassist.controller;

import com.cpassist.dto.MessageResponse;
import com.cpassist.service.CodeforcesSyncService;
import com.cpassist.service.LeetCodeSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/sync")
public class SyncController {
    
    @Autowired
    private LeetCodeSyncService leetCodeSyncService;
    
    @Autowired
    private CodeforcesSyncService codeforcesSyncService;
    
    @PostMapping("/leetcode")
    public ResponseEntity<?> syncLeetCodeProgress(@RequestBody Map<String, String> request) {
        String userId = getCurrentUserId();
        String leetcodeUsername = request.get("leetcodeUsername");
        
        if (leetcodeUsername == null || leetcodeUsername.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("LeetCode username is required"));
        }
        
        try {
            int syncedProblems = leetCodeSyncService.syncUserProgress(userId, leetcodeUsername);
            return ResponseEntity.ok(Map.of(
                "message", "Successfully synced with LeetCode",
                "syncedProblems", syncedProblems
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new MessageResponse("Failed to sync with LeetCode: " + e.getMessage()));
        }
    }
    
    @PostMapping("/codeforces")
    public ResponseEntity<?> syncCodeforcesProgress(@RequestBody Map<String, String> request) {
        String username = getCurrentUserId();
        String codeforcesHandle = request.get("username");
        
        if (codeforcesHandle == null || codeforcesHandle.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Codeforces handle is required"));
        }
        
        try {
            Map<String, Object> result = codeforcesSyncService.syncUserSubmissions(username, codeforcesHandle);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of(
                    "success", false,
                    "message", "Failed to sync with Codeforces: " + e.getMessage()
                ));
        }
    }
    
    @PostMapping("/codechef")
    public ResponseEntity<?> syncCodeChefProgress(@RequestBody Map<String, String> request) {
        // TODO: Implement CodeChef sync
        return ResponseEntity.ok(new MessageResponse("CodeChef sync coming soon!"));
    }
    
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
