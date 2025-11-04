import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Extract tokens from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const username = searchParams.get('username');
        const email = searchParams.get('email');
        const error = searchParams.get('error');

        // Check for error in callback
        if (error) {
          setStatus('error');
          setErrorMessage(decodeURIComponent(error));
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login?error=' + encodeURIComponent(error));
          }, 3000);
          return;
        }

        // Validate tokens
        if (!accessToken || !refreshToken) {
          setStatus('error');
          setErrorMessage('Authentication failed: No tokens received');
          
          setTimeout(() => {
            navigate('/login?error=no_tokens');
          }, 3000);
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        if (username) {
          localStorage.setItem('username', username);
        }
        
        if (email) {
          localStorage.setItem('email', email);
        }

        // Optional: Store user info in context or state management
        // You can dispatch to Redux, Zustand, or Context API here
        
        setStatus('success');
        
        // Redirect to dashboard or home after successful authentication
        setTimeout(() => {
          navigate('/profile');
        }, 1500);

      } catch (err) {
        console.error('Authentication callback error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred');
        
        setTimeout(() => {
          navigate('/login?error=callback_failed');
        }, 3000);
      }
    };

    processAuth();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        
        {status === 'processing' && (
          <div className="text-center">
            {/* Loading Spinner */}
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Processing Authentication
            </h2>
            <p className="text-gray-600">
              Please wait while we complete your sign-in...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <svg 
                className="w-16 h-16 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-gray-600">
              Redirecting you to the dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <svg 
                className="w-16 h-16 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Authentication Failed
            </h2>
            <p className="text-red-600 mb-4">
              {errorMessage || 'An error occurred during authentication'}
            </p>
            <p className="text-gray-600 text-sm">
              Redirecting you back to login...
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AuthCallback;
