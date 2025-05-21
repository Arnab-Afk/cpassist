import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { PageLoader } from '@/components/LoadingSpinner';
import AuthError from '@/components/AuthError';

const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAuthCallback = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the access token from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      if (!accessToken) {
        throw new Error('No access token received from authentication provider');
      }

      // Verify the token with your backend
      const response = await fetch('https://cpbackend.arnabbhowmik019.workers.dev/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to authenticate');
      }

      const data = await response.json();
      
      // Store token and user info in context/localStorage
      login(data.token, data.user);
      
      // Check if there's a saved redirect path from a protected route
      const redirectPath = sessionStorage.getItem('auth_redirect');
      if (redirectPath) {
        // Clear the stored path
        sessionStorage.removeItem('auth_redirect');
        // Redirect to the saved path
        navigate(redirectPath);
      } else {
        // Redirect to home page if no saved path
        navigate('/');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  if (loading) {
    return <PageLoader message="Authenticating..." />;
  }

  if (error) {
    return <AuthError error={error} onRetry={handleAuthCallback} />;
  }

  return null;
};

export default AuthCallback;
