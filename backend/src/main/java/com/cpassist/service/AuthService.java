package com.cpassist.service;

import com.cpassist.dto.*;
import com.cpassist.exception.ResourceNotFoundException;
import com.cpassist.model.User;
import com.cpassist.repository.UserRepository;
import com.cpassist.security.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Value("${google.oauth.client-id}")
    private String googleClientId;
    
    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(loginRequest.getUsername());
        
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return new JwtResponse(accessToken, refreshToken, user.getUsername(), user.getEmail());
    }
    
    public MessageResponse signup(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }
        
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFullName(signupRequest.getFullName());
        
        Set<String> roles = new HashSet<>();
        roles.add("ROLE_USER");
        user.setRoles(roles);
        
        // Initialize user profile
        User.UserProfile profile = new User.UserProfile();
        profile.setPreferredLanguage("java");
        profile.setCurrentStreak(0);
        profile.setLongestStreak(0);
        user.setProfile(profile);
        
        // Initialize platform stats
        User.PlatformStats platformStats = new User.PlatformStats();
        platformStats.setLeetcodeSolved(0);
        platformStats.setCodeforcesRating(0);
        platformStats.setCodechefRating(0);
        platformStats.setHackerrankScore(0);
        user.setPlatformStats(platformStats);
        
        userRepository.save(user);
        
        return new MessageResponse("User registered successfully!");
    }
    
    public JwtResponse refreshToken(String refreshToken) {
        if (tokenProvider.validateToken(refreshToken)) {
            String username = tokenProvider.getUsernameFromToken(refreshToken);
            String newAccessToken = tokenProvider.generateTokenFromUsername(username);
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            return new JwtResponse(newAccessToken, refreshToken, user.getUsername(), user.getEmail());
        }
        throw new RuntimeException("Invalid refresh token");
    }
    
    public JwtResponse authenticateWithGoogle(GoogleUserInfo googleUserInfo) {
        User user = userRepository.findByEmail(googleUserInfo.getEmail())
                .orElseGet(() -> {
                    // Create new user from Google info
                    User newUser = new User();
                    newUser.setEmail(googleUserInfo.getEmail());
                    newUser.setFullName(googleUserInfo.getName());
                    
                    // Generate a clean username from email or name
                    String username = generateUsernameFromGoogleInfo(googleUserInfo);
                    newUser.setUsername(username);
                    
                    // Set random password (user won't use it for Google login)
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    
                    Set<String> roles = new HashSet<>();
                    roles.add("ROLE_USER");
                    newUser.setRoles(roles);
                    
                    // Initialize user profile with Google picture
                    User.UserProfile profile = new User.UserProfile();
                    profile.setPreferredLanguage("java");
                    profile.setCurrentStreak(0);
                    profile.setLongestStreak(0);
                    profile.setAvatar(googleUserInfo.getPicture());
                    newUser.setProfile(profile);
                    
                    // Initialize platform stats
                    User.PlatformStats platformStats = new User.PlatformStats();
                    platformStats.setLeetcodeSolved(0);
                    platformStats.setCodeforcesRating(0);
                    platformStats.setCodechefRating(0);
                    platformStats.setHackerrankScore(0);
                    newUser.setPlatformStats(platformStats);
                    
                    return userRepository.save(newUser);
                });
        
        // Generate JWT tokens
        String accessToken = tokenProvider.generateTokenFromUsername(user.getUsername());
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());
        
        return new JwtResponse(accessToken, refreshToken, user.getUsername(), user.getEmail());
    }
    
    /**
     * Generate a clean username from Google user info
     * Priority: 1) email prefix, 2) name lowercase, 3) email with number
     * Ensures uniqueness by appending numbers if needed
     */
    private String generateUsernameFromGoogleInfo(GoogleUserInfo googleUserInfo) {
        String baseUsername = null;
        
        // Try to get username from email prefix (before @)
        if (googleUserInfo.getEmail() != null && !googleUserInfo.getEmail().isEmpty()) {
            String emailPrefix = googleUserInfo.getEmail().split("@")[0];
            // Clean the username: remove dots, hyphens, underscores and convert to lowercase
            baseUsername = emailPrefix.replaceAll("[.\\-_]", "").toLowerCase();
        }
        
        // If email prefix is empty or too short, use name
        if (baseUsername == null || baseUsername.length() < 3) {
            if (googleUserInfo.getName() != null && !googleUserInfo.getName().isEmpty()) {
                // Remove spaces and special characters, convert to lowercase
                baseUsername = googleUserInfo.getName()
                        .replaceAll("[^a-zA-Z0-9]", "")
                        .toLowerCase();
            }
        }
        
        // Fallback to a default if still empty
        if (baseUsername == null || baseUsername.isEmpty()) {
            baseUsername = "user";
        }
        
        // Ensure username is not too long (max 20 characters)
        if (baseUsername.length() > 20) {
            baseUsername = baseUsername.substring(0, 20);
        }
        
        // Check if username exists, if yes, append a number
        String finalUsername = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = baseUsername + counter;
            counter++;
            
            // Safety check: if counter gets too high, add random suffix
            if (counter > 999) {
                finalUsername = baseUsername + (int)(Math.random() * 10000);
                break;
            }
        }
        
        return finalUsername;
    }
}
