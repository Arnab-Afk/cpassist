package com.cpassist.service;

import com.cpassist.dto.UserResponse;
import com.cpassist.exception.ResourceNotFoundException;
import com.cpassist.model.User;
import com.cpassist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserResponse(user);
    }
    
    public UserResponse updateUserProfile(String username, User.UserProfile profile) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setProfile(profile);
        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }
    
    public UserResponse updatePlatformStats(String username, User.PlatformStats stats) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setPlatformStats(stats);
        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }
    
    public UserResponse markProblemAsSolved(String username, String problemId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.getSolvedProblems().add(problemId);
        user.getAttemptedProblems().add(problemId);
        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }
    
    public UserResponse toggleBookmark(String username, String problemId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getBookmarkedProblems().contains(problemId)) {
            user.getBookmarkedProblems().remove(problemId);
        } else {
            user.getBookmarkedProblems().add(problemId);
        }
        
        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }
    
    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRoles(user.getRoles());
        response.setSolvedProblems(user.getSolvedProblems());
        response.setAttemptedProblems(user.getAttemptedProblems());
        response.setBookmarkedProblems(user.getBookmarkedProblems());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        if (user.getProfile() != null) {
            UserResponse.UserProfileDto profileDto = new UserResponse.UserProfileDto();
            profileDto.setBio(user.getProfile().getBio());
            profileDto.setAvatar(user.getProfile().getAvatar());
            profileDto.setPreferredLanguage(user.getProfile().getPreferredLanguage());
            profileDto.setBadges(user.getProfile().getBadges());
            profileDto.setCurrentStreak(user.getProfile().getCurrentStreak());
            profileDto.setLongestStreak(user.getProfile().getLongestStreak());
            profileDto.setLastSolvedDate(user.getProfile().getLastSolvedDate());
            response.setProfile(profileDto);
        }
        
        if (user.getPlatformStats() != null) {
            UserResponse.PlatformStatsDto statsDto = new UserResponse.PlatformStatsDto();
            statsDto.setLeetcodeSolved(user.getPlatformStats().getLeetcodeSolved());
            statsDto.setCodeforcesRating(user.getPlatformStats().getCodeforcesRating());
            statsDto.setCodechefRating(user.getPlatformStats().getCodechefRating());
            statsDto.setHackerrankScore(user.getPlatformStats().getHackerrankScore());
            response.setPlatformStats(statsDto);
        }
        
        return response;
    }
}
