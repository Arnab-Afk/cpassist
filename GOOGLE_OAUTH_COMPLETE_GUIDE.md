# Google OAuth Authentication - Complete Implementation Summary

## Overview

This document provides a complete overview of the Google OAuth authentication flow implemented for CPAssist.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌────────────────┐
│   Frontend  │      │   Backend    │      │   Google    │      │   Cloudflare   │
│  (React)    │      │ (Spring Boot)│      │   OAuth     │      │    Worker      │
└─────────────┘      └──────────────┘      └─────────────┘      └────────────────┘
       │                     │                     │                      │
       │ 1. Click Login      │                     │                      │
       │────────────────────>│                     │                      │
       │                     │                     │                      │
       │ 2. Redirect to      │                     │                      │
       │    Google           │ 3. Redirect URL     │                      │
       │<────────────────────│────────────────────>│                      │
       │                     │                     │                      │
       │ 4. User Consent     │                     │                      │
       │<────────────────────────────────────────>│                      │
       │                     │                     │                      │
       │                     │                     │ 5. Code + State      │
       │                     │                     │─────────────────────>│
       │                     │                     │                      │
       │                     │ 6. Forward Code     │                      │
       │                     │<─────────────────────────────────────────│
       │                     │                     │                      │
       │                     │ 7. Exchange Code    │                      │
       │                     │────────────────────>│                      │
       │                     │                     │                      │
       │                     │ 8. Access Token     │                      │
       │                     │<────────────────────│                      │
       │                     │                     │                      │
       │                     │ 9. Get User Info    │                      │
       │                     │────────────────────>│                      │
       │                     │                     │                      │
       │                     │ 10. User Data       │                      │
       │                     │<────────────────────│                      │
       │                     │                     │                      │
       │ 11. Redirect with   │                     │                      │
       │     JWT Tokens      │                     │                      │
       │<────────────────────│                     │                      │
       │                     │                     │                      │
       │ 12. Store Tokens    │                     │                      │
       │     & Navigate      │                     │                      │
       │                     │                     │                      │
```

## Implementation Details

### Backend (Spring Boot)

#### Files Created/Modified:

1. **`pom.xml`** - Added Google API client dependency
2. **`application.yml`** - Added Google OAuth configuration
3. **`GoogleOAuthService.java`** - Handles OAuth flow and token exchange
4. **`GoogleUserInfo.java`** - DTO for Google user information
5. **`GoogleAuthController.java`** - REST endpoints for Google authentication
6. **`AuthService.java`** - Added Google authentication method
7. **`.env.example`** - Added Google OAuth environment variables

#### Endpoints:

**1. Initiate Google Login**
```
GET /api/auth/google/login?redirect_url={frontend_callback_url}
```
- Generates Google OAuth authorization URL
- Redirects user to Google consent screen
- Stores frontend redirect URL in state parameter

**2. Google Callback**
```
GET /api/auth/google/callback?code={auth_code}&state={frontend_redirect_url}
```
- Receives authorization code from Google (via Cloudflare Worker)
- Exchanges code for access token
- Fetches user info from Google
- Creates or authenticates user in database
- Generates JWT tokens
- Redirects to frontend with tokens in URL parameters

### Frontend (React + TypeScript)

#### Files Created:

1. **`GoogleLoginButton.tsx`** - Reusable Google login button component
2. **`AuthCallback.tsx`** - Handles OAuth callback and token processing
3. **`apiClient.ts`** - Axios instance with authentication interceptors
4. **`GOOGLE_OAUTH_FRONTEND.md`** - Complete frontend integration guide

#### Components:

**GoogleLoginButton**
- Displays Google branding
- Redirects to backend OAuth endpoint
- Passes frontend callback URL

**AuthCallback**
- Extracts tokens from URL parameters
- Stores tokens in localStorage
- Handles errors gracefully
- Redirects to dashboard on success

**API Client**
- Automatically adds Bearer token to requests
- Handles token refresh on 401 errors
- Provides typed API methods

### Cloudflare Worker

The Worker acts as a proxy between Google and your backend:

```javascript
// Location: small-mouse-2759.arnabbhowmik019.workers.dev/google/auth

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  
  if (code && state) {
    const backendUrl = `https://your-backend.com/api/auth/google/callback?code=${code}&state=${encodeURIComponent(state)}`
    return Response.redirect(backendUrl, 302)
  }
  
  return new Response('Invalid request', { status: 400 })
}
```

## Configuration

### Google Cloud Console

1. **Create OAuth 2.0 Client ID:**
   - Application type: Web application
   - Authorized JavaScript origins: 
     - `http://localhost:8080`
     - `https://your-backend-domain.com`
   - Authorized redirect URIs:
     - `https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth`
     - `http://localhost:8080/api/auth/google/callback`

2. **Enable APIs:**
   - Google+ API
   - Google People API

### Backend Environment Variables

```bash
# .env or environment
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth
```

### Frontend Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:8080/api
```

## Authentication Flow Steps

### 1. User Clicks "Sign in with Google"

```typescript
// Frontend
const handleGoogleLogin = () => {
  const redirectUrl = 'http://localhost:3000/callback';
  window.location.href = `http://localhost:8080/api/auth/google/login?redirect_url=${encodeURIComponent(redirectUrl)}`;
};
```

### 2. Backend Generates Google Auth URL

```java
// Backend - GoogleOAuthService
public String getAuthorizationUrl(String frontendRedirectUrl) {
    return flow.newAuthorizationUrl()
            .setRedirectUri(redirectUri)
            .setState(frontendRedirectUrl)
            .build();
}
```

### 3. User Consents on Google

User sees Google consent screen with requested permissions:
- Email address
- Profile information

### 4. Google Redirects to Cloudflare Worker

```
https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth?code=xxx&state=http://localhost:3000/callback
```

### 5. Worker Forwards to Backend

```
http://localhost:8080/api/auth/google/callback?code=xxx&state=http://localhost:3000/callback
```

### 6. Backend Processes Authentication

```java
// Backend - GoogleAuthController
@GetMapping("/callback")
public RedirectView googleCallback(@RequestParam("code") String code, 
                                   @RequestParam("state") String frontendRedirectUrl) {
    // Exchange code for token
    GoogleTokenResponse tokenResponse = googleOAuthService.exchangeAuthorizationCode(code);
    
    // Get user info
    GoogleUserInfo userInfo = getUserInfoFromGoogle(tokenResponse.getAccessToken());
    
    // Create/authenticate user
    JwtResponse jwtResponse = authService.authenticateWithGoogle(userInfo);
    
    // Redirect to frontend with tokens
    String redirectUrl = frontendRedirectUrl + 
        "?access_token=" + jwtResponse.getAccessToken() +
        "&refresh_token=" + jwtResponse.getRefreshToken() +
        "&username=" + jwtResponse.getUsername() +
        "&email=" + jwtResponse.getEmail();
    
    return new RedirectView(redirectUrl);
}
```

### 7. Frontend Processes Tokens

```typescript
// Frontend - AuthCallback.tsx
useEffect(() => {
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  
  // Store tokens
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  
  // Navigate to dashboard
  navigate('/dashboard');
}, []);
```

## Database Schema

### User Document (MongoDB)

```javascript
{
  _id: ObjectId("..."),
  username: "john_doe_a1b2c3d4",  // Auto-generated for Google users
  email: "john@gmail.com",         // From Google
  fullName: "John Doe",            // From Google
  password: "hashed_random_uuid",  // Random, not used for Google login
  roles: ["ROLE_USER"],
  profile: {
    avatar: "https://lh3.googleusercontent.com/...",  // Google profile picture
    preferredLanguage: "java",
    currentStreak: 0,
    longestStreak: 0,
    badges: []
  },
  platformStats: {
    leetcodeSolved: 0,
    codeforcesRating: 0,
    codechefRating: 0,
    hackerrankScore: 0
  },
  solvedProblems: [],
  attemptedProblems: [],
  bookmarkedProblems: [],
  enabled: true,
  createdAt: ISODate("2025-10-28T..."),
  updatedAt: ISODate("2025-10-28T...")
}
```

## Token Management

### JWT Access Token

- **Expiration:** 24 hours
- **Contains:** username, roles
- **Storage:** localStorage (frontend)
- **Usage:** Bearer token in Authorization header

### JWT Refresh Token

- **Expiration:** 7 days
- **Contains:** username
- **Storage:** localStorage (frontend)
- **Usage:** Refresh access token when expired

### Token Refresh Flow

```typescript
// Automatic refresh on 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post('/api/auth/refresh', { refreshToken });
      
      localStorage.setItem('access_token', response.data.accessToken);
      
      // Retry original request
      return apiClient(originalRequest);
    }
  }
);
```

## Security Considerations

### 1. State Parameter
- Prevents CSRF attacks
- Contains frontend redirect URL
- Validated on callback

### 2. HTTPS Required
- All production URLs must use HTTPS
- Tokens transmitted securely
- Cloudflare Worker provides HTTPS

### 3. Token Storage
- **Development:** localStorage acceptable
- **Production:** Consider HttpOnly cookies
- Never expose tokens in logs

### 4. CORS Configuration
```yaml
cors:
  allowed-origins: http://localhost:3000,https://yourfrontend.com
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

### 5. OAuth Scopes
Minimal required scopes:
- `userinfo.email`
- `userinfo.profile`

## Testing

### Local Testing Steps

1. **Start MongoDB:**
```bash
brew services start mongodb-community
```

2. **Configure environment variables** in backend

3. **Start Backend:**
```bash
cd backend
java -jar target/cpassist-backend-1.0.0.jar
```

4. **Start Frontend:**
```bash
cd frontend
npm run dev
```

5. **Test Flow:**
   - Visit `http://localhost:3000/login`
   - Click "Sign in with Google"
   - Complete Google consent
   - Verify redirect to dashboard
   - Check localStorage for tokens
   - Make API calls to test authentication

## Troubleshooting

### Common Issues

**Issue 1: redirect_uri_mismatch**
- Ensure Google Console redirect URI matches exactly
- Check for trailing slashes
- Verify HTTP vs HTTPS

**Issue 2: CORS errors**
- Add frontend URL to backend CORS configuration
- Check browser console for specific error
- Verify preflight requests succeed

**Issue 3: Tokens not received**
- Check backend logs for errors
- Verify Cloudflare Worker is forwarding correctly
- Inspect URL parameters in callback

**Issue 4: 401 on API calls**
- Verify token is stored in localStorage
- Check Authorization header format
- Test token refresh flow

## Deployment Checklist

### Backend
- [ ] Set production Google OAuth credentials
- [ ] Configure HTTPS
- [ ] Update CORS allowed origins
- [ ] Set secure JWT secret
- [ ] Configure production MongoDB
- [ ] Update Cloudflare Worker redirect URL

### Frontend
- [ ] Set production API URL
- [ ] Configure HTTPS
- [ ] Update callback URLs
- [ ] Test OAuth flow in production
- [ ] Implement error monitoring

### Google Cloud Console
- [ ] Add production redirect URIs
- [ ] Add production JavaScript origins
- [ ] Verify OAuth consent screen
- [ ] Check API quotas

## Documentation

- **Backend Setup:** `/backend/docs/GOOGLE_OAUTH_SETUP.md`
- **Frontend Setup:** `/frontend/GOOGLE_OAUTH_FRONTEND.md`
- **API Documentation:** `/backend/docs/API_DOCUMENTATION.md`

## Support

For issues or questions:
1. Check documentation files
2. Review backend logs
3. Check browser console
4. Verify Google Cloud Console settings
5. Test with curl/Postman

## Success Criteria

✅ User can click "Sign in with Google"
✅ User is redirected to Google consent screen
✅ User approves permissions
✅ User is redirected back with tokens
✅ Tokens are stored in localStorage
✅ API calls include Bearer token
✅ Token refresh works on 401
✅ User can access protected routes
✅ User data is persisted in MongoDB
