# Google OAuth Integration - Frontend

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install axios react-router-dom
# or
yarn add axios react-router-dom
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
```

For production:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### 3. Router Configuration

Update your router to include the callback route:

```typescript
// src/main.tsx or src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Usage

### Basic Login Page Example

```typescript
// src/pages/Login.tsx
import React from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to CPAssist
          </h2>
          <p className="mt-2 text-gray-600">
            Track your competitive programming progress
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Login Button */}
          <GoogleLoginButton 
            callbackUrl={`${window.location.origin}/callback`}
            onError={(error) => {
              console.error('Google login error:', error);
              alert('Failed to login with Google: ' + error);
            }}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Traditional login form */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

### Protected Route Example

```typescript
// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/apiClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Usage in routes:
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### Using the API Client

```typescript
// Example: Fetching user profile
import { userAPI } from '../lib/apiClient';

const Dashboard: React.FC = () => {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userAPI.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {profile?.username}!</h1>
      <p>{profile?.email}</p>
    </div>
  );
};
```

### Example: Using Problems API

```typescript
import { problemsAPI } from '../lib/apiClient';

const ProblemsPage: React.FC = () => {
  const [problems, setProblems] = React.useState([]);

  React.useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await problemsAPI.getAll({
          page: 0,
          size: 20,
          topic: 'ARRAY',
          difficulty: 'MEDIUM'
        });
        setProblems(data.content);
      } catch (error) {
        console.error('Failed to fetch problems:', error);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div>
      {problems.map(problem => (
        <div key={problem.id}>
          <h3>{problem.title}</h3>
          <p>{problem.difficulty}</p>
        </div>
      ))}
    </div>
  );
};
```

## Authentication Flow

### Flow Diagram

```
User clicks "Sign in with Google"
        ↓
Frontend redirects to: /api/auth/google/login?redirect_url=http://localhost:3000/callback
        ↓
Backend redirects to Google OAuth consent screen
        ↓
User approves permissions
        ↓
Google redirects to Cloudflare Worker with auth code
        ↓
Worker forwards to: /api/auth/google/callback?code=xxx&state=http://localhost:3000/callback
        ↓
Backend exchanges code for tokens
Backend creates/authenticates user
Backend generates JWT tokens
        ↓
Backend redirects to: http://localhost:3000/callback?access_token=xxx&refresh_token=yyy&username=xxx&email=xxx
        ↓
Frontend AuthCallback component processes tokens
Stores tokens in localStorage
        ↓
Redirects to Dashboard
```

## Token Management

### Access Token

- Stored in `localStorage` as `access_token`
- Automatically attached to all API requests via interceptor
- Expires in 24 hours
- Format: `Bearer <token>`

### Refresh Token

- Stored in `localStorage` as `refresh_token`
- Used to get new access token when expired
- Expires in 7 days
- Automatically refreshed by interceptor when 401 received

### Auto Token Refresh

The API client automatically handles token refresh:

```typescript
// When a request fails with 401:
1. Extract refresh token from localStorage
2. Call /api/auth/refresh endpoint
3. Store new access token
4. Retry the original request with new token
5. If refresh fails, redirect to login
```

## Security Best Practices

### 1. Token Storage

**Development:**
- localStorage is acceptable for development

**Production:**
- Consider using HttpOnly cookies for better security
- Implement secure cookie handling on backend
- Use `sameSite: 'strict'` for CSRF protection

### 2. HTTPS

Always use HTTPS in production:
- Backend API must use HTTPS
- Cloudflare Worker uses HTTPS by default
- Frontend should be served over HTTPS

### 3. Environment Variables

Never commit secrets to git:
```bash
# .gitignore
.env
.env.local
.env.production
```

### 4. CORS Configuration

Backend must allow frontend domain:
```yaml
# application.yml
cors:
  allowed-origins: https://yourfrontend.com,http://localhost:3000
```

## Troubleshooting

### Issue: "redirect_uri_mismatch"

**Solution:**
- Ensure the redirect URI in Google Console matches exactly
- Check for trailing slashes
- Verify HTTP vs HTTPS

### Issue: Tokens not being stored

**Solution:**
- Check browser console for errors
- Ensure callback URL parameters are correct
- Verify localStorage is enabled

### Issue: 401 Unauthorized on API calls

**Solution:**
- Check if token is in localStorage
- Verify token format: `Bearer <token>`
- Token might be expired, try refreshing
- Clear localStorage and login again

### Issue: Infinite redirect loop

**Solution:**
- Check protected route implementation
- Ensure `isAuthenticated()` function works correctly
- Clear browser cache and localStorage

## Testing

### Manual Testing

1. Start backend: `cd backend && java -jar target/cpassist-backend-1.0.0.jar`
2. Start frontend: `cd frontend && npm run dev`
3. Visit `http://localhost:3000/login` (or your dev port)
4. Click "Sign in with Google"
5. Approve permissions
6. Verify redirect to callback
7. Verify redirect to dashboard
8. Check localStorage for tokens

### Test API Calls

```typescript
// Test in browser console
import { userAPI } from './lib/apiClient';

// Get profile
userAPI.getProfile()
  .then(data => console.log('Profile:', data))
  .catch(err => console.error('Error:', err));
```

## Additional Features

### Logout Button

```typescript
import { authAPI } from '../lib/apiClient';

const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    authAPI.logout();
    // User will be redirected to /login
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};
```

### User Context Provider

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../lib/apiClient';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        setUser(getCurrentUser());
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
