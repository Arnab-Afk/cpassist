package com.cpassist.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private String fullName;
    
    private Set<String> roles = new HashSet<>();
    
    private UserProfile profile;
    
    private Set<String> solvedProblems = new HashSet<>();
    
    private Set<String> attemptedProblems = new HashSet<>();
    
    private Set<String> bookmarkedProblems = new HashSet<>();
    
    private PlatformStats platformStats;
    
    private boolean enabled = true;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public User() {
    }
    
    public User(String id, String username, String email, String password, String fullName,
                Set<String> roles, UserProfile profile, Set<String> solvedProblems,
                Set<String> attemptedProblems, Set<String> bookmarkedProblems,
                PlatformStats platformStats, boolean enabled, LocalDateTime createdAt,
                LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.roles = roles;
        this.profile = profile;
        this.solvedProblems = solvedProblems;
        this.attemptedProblems = attemptedProblems;
        this.bookmarkedProblems = bookmarkedProblems;
        this.platformStats = platformStats;
        this.enabled = enabled;
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
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
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
    
    public UserProfile getProfile() {
        return profile;
    }
    
    public void setProfile(UserProfile profile) {
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
    
    public PlatformStats getPlatformStats() {
        return platformStats;
    }
    
    public void setPlatformStats(PlatformStats platformStats) {
        this.platformStats = platformStats;
    }
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
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
    
    public static class UserProfile {
        private String bio;
        private String avatar;
        private String preferredLanguage;
        private Set<String> badges = new HashSet<>();
        private int currentStreak;
        private int longestStreak;
        private LocalDateTime lastSolvedDate;
        
        public UserProfile() {
        }
        
        public UserProfile(String bio, String avatar, String preferredLanguage, Set<String> badges,
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
    
    public static class PlatformStats {
        private int leetcodeSolved;
        private int codeforcesRating;
        private int codechefRating;
        private int hackerrankScore;
        
        public PlatformStats() {
        }
        
        public PlatformStats(int leetcodeSolved, int codeforcesRating, int codechefRating, int hackerrankScore) {
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
