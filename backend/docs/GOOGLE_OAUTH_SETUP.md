# Google OAuth Setup Guide

## Overview

The CPAssist backend now supports Google OAuth authentication. The flow works as follows:

1. Frontend initiates Google login with a redirect URL
2. User is redirected to Google consent screen
3. Google redirects to Cloudflare Worker with authorization code
4. Cloudflare Worker forwards code to backend
5. Backend exchanges code for tokens and user info
6. Backend creates/authenticates user and generates JWT tokens
7. User is redirected back to frontend with JWT tokens in URL parameters

## Backend Configuration

### 1. Environment Variables

Add these to your `.env` file or environment:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth`
   - `http://localhost:8080/api/auth/google/callback` (for local testing)

## API Endpoints

### Initiate Google Login

```
GET /api/auth/google/login?redirect_url={frontend_callback_url}
```

**Parameters:**
- `redirect_url`: The frontend URL where user should be redirected after authentication
  - Example: `http://localhost:3000/callback`
  - Example: `https://yourapp.com/auth/success`

**Example:**
```javascript
// Frontend code
const handleGoogleLogin = () => {
  const redirectUrl = encodeURIComponent('http://localhost:3000/callback');
  window.location.href = `http://localhost:8080/api/auth/google/login?redirect_url=${redirectUrl}`;
};
```

### Google Callback (Backend endpoint)

```
GET /api/auth/google/callback?code={auth_code}&state={frontend_redirect_url}
```

This endpoint is called by Google (via Cloudflare Worker) and should not be called directly by frontend.

**Response:**
Redirects to frontend with parameters:
- `access_token`: JWT access token
- `refresh_token`: JWT refresh token
- `username`: User's username
- `email`: User's email

## Cloudflare Worker Configuration

The Cloudflare Worker at `small-mouse-2759.arnabbhowmik019.workers.dev/google/auth` should:

1. Receive the authorization code from Google
2. Forward it to your backend: `http://localhost:8080/api/auth/google/callback`
3. The backend will handle the redirect to frontend

### Example Cloudflare Worker Code

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Extract code and state from Google callback
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') // This is the frontend redirect URL
  
  if (code && state) {
    // Forward to backend
    const backendUrl = `https://your-backend-url.com/api/auth/google/callback?code=${code}&state=${encodeURIComponent(state)}`
    
    // Redirect to backend
    return Response.redirect(backendUrl, 302)
  }
  
  return new Response('Invalid request', { status: 400 })
}
```

## Frontend Integration

### 1. Login Button

```javascript
import React from 'react';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    const frontendRedirectUrl = 'http://localhost:3000/callback';
    const backendUrl = `http://localhost:8080/api/auth/google/login?redirect_url=${encodeURIComponent(frontendRedirectUrl)}`;
    
    // Redirect to backend which will redirect to Google
    window.location.href = backendUrl;
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
```

### 2. Callback Page

```javascript
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const error = searchParams.get('error');

    if (error) {
      console.error('Authentication error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens in localStorage or state management
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);

      // Redirect to home or dashboard
      navigate('/dashboard');
    } else {
      navigate('/login?error=no_tokens');
    }
  }, [searchParams, navigate]);

  return (
    <div>
      <h2>Processing authentication...</h2>
    </div>
  );
};

export default AuthCallback;
```

### 3. Using the Tokens

```javascript
// API client example
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Add token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      
      try {
        const response = await axios.post('http://localhost:8080/api/auth/refresh', {
          refreshToken
        });
        
        localStorage.setItem('access_token', response.data.accessToken);
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## Testing

### Local Testing

1. Start MongoDB:
```bash
brew services start mongodb-community
```

2. Set environment variables in `.env` or `application.yml`

3. Build and run backend:
```bash
cd backend
mvn clean install -DskipTests
java -jar target/cpassist-backend-1.0.0.jar
```

4. Test the flow:
   - Visit: `http://localhost:8080/api/auth/google/login?redirect_url=http://localhost:3000/callback`
   - Consent to Google permissions
   - You should be redirected back with tokens

## Security Considerations

1. **HTTPS Required**: In production, ensure all endpoints use HTTPS
2. **CORS Configuration**: Update `application.yml` to include your frontend domains
3. **Token Storage**: Store tokens securely (HttpOnly cookies recommended for production)
4. **State Parameter**: The state parameter prevents CSRF attacks
5. **Token Expiration**: Access tokens expire in 24 hours, use refresh tokens to get new ones

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in Google Console exactly matches the one in your config
   - Check for trailing slashes or http vs https

2. **CORS errors**
   - Add your frontend URL to `cors.allowed-origins` in `application.yml`
   - Ensure the worker URL is also included if needed

3. **"Invalid refresh token"**
   - Refresh tokens are single-use in some implementations
   - Check token expiration settings

4. **User already exists with different login method**
   - The system matches users by email
   - If user signed up with email/password, they can also login with Google using the same email

## Flow Diagram

```
Frontend                  Backend                  Google              Cloudflare Worker
   |                         |                        |                        |
   |-- GET /auth/google/login (with redirect_url) -->|                        |
   |                         |                        |                        |
   |                         |-- Redirect to Google ->|                        |
   |                         |                        |                        |
   |<---------------------- Google Consent Screen ---|                        |
   |                         |                        |                        |
   |-- User approves ------->|                        |                        |
   |                         |                        |                        |
   |                         |                        |-- code & state ------>|
   |                         |                        |                        |
   |                         |<-- code & state ----------------------<---------|
   |                         |                        |                        |
   |                         |-- Exchange code for tokens with Google -------->|
   |                         |                        |                        |
   |                         |<-- Access token + user info -------------------|
   |                         |                        |                        |
   |                         |-- Create/authenticate user                     |
   |                         |-- Generate JWT tokens                          |
   |                         |                        |                        |
   |<-- Redirect with JWT tokens in URL params ------|                        |
   |                         |                        |                        |
   |-- Parse tokens & store |                        |                        |
   |-- Navigate to dashboard|                        |                        |
```
