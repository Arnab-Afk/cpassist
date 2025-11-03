package com.cpassist.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class UserResponse {
    
    private String id;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;
    private UserProfileDto profile;
    private Set<String> solvedProblems;
    private Set<String> attemptedProblems;
    private Set<String> bookmarkedProblems;
    private PlatformStatsDto platformStats;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public UserResponse() {
    }
    
    public UserResponse(String id, String username, String email, String fullName, Set<String> roles,
                        UserProfileDto profile, Set<String> solvedProblems, Set<String> attemptedProblems,
                        Set<String> bookmarkedProblems, PlatformStatsDto platformStats,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
        this.profile = profile;
        this.solvedProblems = solvedProblems;
        this.attemptedProblems = attemptedProblems;
        this.bookmarkedProblems = bookmarkedProblems;
        this.platformStats = platformStats;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public Set<String> getRoles() {
        return roles;
    }
    
    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
    
    public UserProfileDto getProfile() {
        return profile;
    }
    
    public void setProfile(UserProfileDto profile) {
        this.profile = profile;
    }
    
    public Set<String> getSolvedProblems() {
        return solvedProblems;
    }
    
    public void setSolvedProblems(Set<String> solvedProblems) {
        this.solvedProblems = solvedProblems;
    }
    
    public Set<String> getAttemptedProblems() {
        return attemptedProblems;
    }
    
    public void setAttemptedProblems(Set<String> attemptedProblems) {
        this.attemptedProblems = attemptedProblems;
    }
    
    public Set<String> getBookmarkedProblems() {
        return bookmarkedProblems;
    }
    
    public void setBookmarkedProblems(Set<String> bookmarkedProblems) {
        this.bookmarkedProblems = bookmarkedProblems;
    }
    
    public PlatformStatsDto getPlatformStats() {
        return platformStats;
    }
    
    public void setPlatformStats(PlatformStatsDto platformStats) {
        this.platformStats = platformStats;
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
    
    public static class UserProfileDto {
        private String bio;
        private String avatar;
        private String preferredLanguage;
        private Set<String> badges;
        private int currentStreak;
        private int longestStreak;
        private LocalDateTime lastSolvedDate;
        
        public UserProfileDto() {
        }
        
        public UserProfileDto(String bio, String avatar, String preferredLanguage, Set<String> badges,
                             int currentStreak, int longestStreak, LocalDateTime lastSolvedDate) {
            this.bio = bio;
            this.avatar = avatar;
            this.preferredLanguage = preferredLanguage;
            this.badges = badges;
            this.currentStreak = currentStreak;
            this.longestStreak = longestStreak;
            this.lastSolvedDate = lastSolvedDate;
        }
        
        public String getBio() {
            return bio;
        }
        
        public void setBio(String bio) {
            this.bio = bio;
        }
        
        public String getAvatar() {
            return avatar;
        }
        
        public void setAvatar(String avatar) {
            this.avatar = avatar;
        }
        
        public String getPreferredLanguage() {
            return preferredLanguage;
        }
        
        public void setPreferredLanguage(String preferredLanguage) {
            this.preferredLanguage = preferredLanguage;
        }
        
        public Set<String> getBadges() {
            return badges;
        }
        
        public void setBadges(Set<String> badges) {
            this.badges = badges;
        }
        
        public int getCurrentStreak() {
            return currentStreak;
        }
        
        public void setCurrentStreak(int currentStreak) {
            this.currentStreak = currentStreak;
        }
        
        public int getLongestStreak() {
            return longestStreak;
        }
        
        public void setLongestStreak(int longestStreak) {
            this.longestStreak = longestStreak;
        }
        
        public LocalDateTime getLastSolvedDate() {
            return lastSolvedDate;
        }
        
        public void setLastSolvedDate(LocalDateTime lastSolvedDate) {
            this.lastSolvedDate = lastSolvedDate;
        }
    }
    
    public static class PlatformStatsDto {
        private int leetcodeSolved;
        private int codeforcesRating;
        private int codechefRating;
        private int hackerrankScore;
        
        public PlatformStatsDto() {
        }
        
        public PlatformStatsDto(int leetcodeSolved, int codeforcesRating, int codechefRating, int hackerrankScore) {
            this.leetcodeSolved = leetcodeSolved;
            this.codeforcesRating = codeforcesRating;
            this.codechefRating = codechefRating;
            this.hackerrankScore = hackerrankScore;
        }
        
        public int getLeetcodeSolved() {
            return leetcodeSolved;
        }
        
        public void setLeetcodeSolved(int leetcodeSolved) {
            this.leetcodeSolved = leetcodeSolved;
        }
        
        public int getCodeforcesRating() {
            return codeforcesRating;
        }
        
        public void setCodeforcesRating(int codeforcesRating) {
            this.codeforcesRating = codeforcesRating;
        }
        
        public int getCodechefRating() {
            return codechefRating;
        }
        
        public void setCodechefRating(int codechefRating) {
            this.codechefRating = codechefRating;
        }
        
        public int getHackerrankScore() {
            return hackerrankScore;
        }
        
        public void setHackerrankScore(int hackerrankScore) {
            this.hackerrankScore = hackerrankScore;
        }
    }
}
