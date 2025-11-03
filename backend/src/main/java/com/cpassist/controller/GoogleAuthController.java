package com.cpassist.controller;

import com.cpassist.dto.GoogleUserInfo;
import com.cpassist.dto.JwtResponse;
import com.cpassist.service.AuthService;
import com.cpassist.service.GoogleOAuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/auth/google")
public class GoogleAuthController {

    @Autowired
    private GoogleOAuthService googleOAuthService;

    @Autowired
    private AuthService authService;

    /**
     * Initiates Google OAuth flow
     * Frontend calls this endpoint with redirect_url parameter
     * User is redirected to Google consent screen
     */
    @GetMapping("/login")
    public RedirectView googleLogin(@RequestParam("redirect_url") String redirectUrl) {
        String authUrl = googleOAuthService.getAuthorizationUrl(redirectUrl);
        RedirectView redirectView = new RedirectView();
        redirectView.setUrl(authUrl);
        return redirectView;
    }

    /**
     * Cloudflare Worker forwards the OAuth callback here
     * Handles both: OAuth code from Google OR access_token from worker
     */
    @GetMapping("/callback")
    public RedirectView googleCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "access_token", required = false) String accessToken,
            @RequestParam(value = "frontend_redirect", required = false) String frontendRedirectUrl,
            @RequestParam(value = "state", required = false) String state) {
        
        // Use frontend_redirect parameter, fallback to state, or use default
        String redirectUrl = frontendRedirectUrl;
        if (redirectUrl == null || redirectUrl.isEmpty()) {
            redirectUrl = state;
        }
        if (redirectUrl == null || redirectUrl.isEmpty()) {
            redirectUrl = "http://localhost:5173/auth/callback";
        }
        
        try {
            // If we have an access_token directly (from worker), use it
            // Otherwise, exchange the code for an access_token
            String googleAccessToken = accessToken;
            
            if (googleAccessToken == null || googleAccessToken.isEmpty()) {
                if (code == null || code.isEmpty()) {
                    throw new IllegalArgumentException("Either 'code' or 'access_token' parameter is required");
                }
                // Exchange authorization code for access token
                GoogleTokenResponse tokenResponse = googleOAuthService.exchangeAuthorizationCode(code);
                googleAccessToken = tokenResponse.getAccessToken();
            }

            // Get user info from Google
            GoogleUserInfo userInfo = getUserInfoFromGoogle(googleAccessToken);

            // Authenticate or create user in our system
            JwtResponse jwtResponse = authService.authenticateWithGoogle(userInfo);

            // Redirect to frontend with JWT tokens
            String finalRedirectUrl = redirectUrl + 
                    "?access_token=" + URLEncoder.encode(jwtResponse.getAccessToken(), StandardCharsets.UTF_8) +
                    "&refresh_token=" + URLEncoder.encode(jwtResponse.getRefreshToken(), StandardCharsets.UTF_8) +
                    "&username=" + URLEncoder.encode(jwtResponse.getUsername(), StandardCharsets.UTF_8) +
                    "&email=" + URLEncoder.encode(jwtResponse.getEmail(), StandardCharsets.UTF_8);

            RedirectView redirectView = new RedirectView();
            redirectView.setUrl(finalRedirectUrl);
            return redirectView;

        } catch (Exception e) {
            // Redirect to frontend with error
            String errorUrl = redirectUrl + "?error=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            RedirectView redirectView = new RedirectView();
            redirectView.setUrl(errorUrl);
            return redirectView;
        }
    }

    /**
     * Helper method to get user info from Google using access token
     */
    private GoogleUserInfo getUserInfoFromGoogle(String accessToken) throws Exception {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
        URL url = new URL(userInfoUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + accessToken);

        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();

        // Parse JSON response (simple parsing)
        String json = response.toString();
        GoogleUserInfo userInfo = new GoogleUserInfo();
        
        userInfo.setId(extractJsonValue(json, "id"));
        userInfo.setEmail(extractJsonValue(json, "email"));
        userInfo.setName(extractJsonValue(json, "name"));
        userInfo.setPicture(extractJsonValue(json, "picture"));
        userInfo.setVerifiedEmail(Boolean.parseBoolean(extractJsonValue(json, "verified_email")));

        return userInfo;
    }

    /**
     * Simple JSON value extractor
     */
    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\":";
        int startIndex = json.indexOf(searchKey);
        if (startIndex == -1) return "";
        
        startIndex += searchKey.length();
        
        // Skip whitespace and quotes
        while (startIndex < json.length() && (json.charAt(startIndex) == ' ' || json.charAt(startIndex) == '"')) {
            startIndex++;
        }
        
        int endIndex = startIndex;
        boolean inQuotes = json.charAt(startIndex - 1) == '"';
        
        if (inQuotes) {
            endIndex = json.indexOf("\"", startIndex);
        } else {
            while (endIndex < json.length() && json.charAt(endIndex) != ',' && json.charAt(endIndex) != '}') {
                endIndex++;
            }
        }
        
        return json.substring(startIndex, endIndex);
    }
}
