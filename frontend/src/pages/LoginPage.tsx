import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// Interface for location state with optional from path
interface LocationState {
  from?: string;
}

// Google logo component
const GoogleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Check if user was redirected from a protected route
  useEffect(() => {
    const state = location.state as LocationState;
    if (state && state.from) {
      setRedirectPath(state.from);
      // Store for potential use after auth callback
      sessionStorage.setItem('auth_redirect', state.from);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath || '/');
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    
    // Construct the redirect URI - this should be the callback URL in your application
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    // Store the intended destination in sessionStorage for use after auth callback
    if (redirectPath) {
      sessionStorage.setItem('auth_redirect', redirectPath);
    }
    
    // Redirect to the Google Auth endpoint
    window.location.href = `https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth?redirect_url=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border-2 border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to CP Assist</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to track your competitive programming progress</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={cn(
              "w-full bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" message="" />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              <>
                <GoogleLogo />
                <span className="ml-2">Sign in with Google</span>
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
