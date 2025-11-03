package com.cpassist.controller;

import com.cpassist.dto.UserResponse;
import com.cpassist.model.User;
import com.cpassist.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUserProfile() {
        String username = getCurrentUsername();
        UserResponse response = userService.getUserProfile(username);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable String username) {
        UserResponse response = userService.getUserProfile(username);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody User.UserProfile profile) {
        String username = getCurrentUsername();
        UserResponse response = userService.updateUserProfile(username, profile);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/platform-stats")
    public ResponseEntity<UserResponse> updatePlatformStats(@RequestBody User.PlatformStats stats) {
        String username = getCurrentUsername();
        UserResponse response = userService.updatePlatformStats(username, stats);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/problems/{problemId}/solve")
    public ResponseEntity<UserResponse> markProblemAsSolved(@PathVariable String problemId) {
        String username = getCurrentUsername();
        UserResponse response = userService.markProblemAsSolved(username, problemId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/problems/{problemId}/bookmark")
    public ResponseEntity<UserResponse> toggleBookmark(@PathVariable String problemId) {
        String username = getCurrentUsername();
        UserResponse response = userService.toggleBookmark(username, problemId);
        return ResponseEntity.ok(response);
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
