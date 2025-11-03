import React from 'react';

interface GoogleLoginButtonProps {
  callbackUrl?: string;
  onError?: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  callbackUrl,
  onError 
}) => {
  
  const handleGoogleLogin = () => {
    try {
      // Cloudflare Worker URL
      const workerUrl = 'https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth';
      
      // Backend callback URL - where worker should send the OAuth code
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const backendCallback = `${backendUrl}/auth/google/callback`;
      
      // Frontend callback URL - where user will land with JWT tokens
      const finalCallbackUrl = callbackUrl || 
                               import.meta.env.VITE_OAUTH_CALLBACK_URL || 
                               `${window.location.origin}/auth/callback`;
      
      // Encode the redirect URL with frontend callback embedded
      const redirectUrl = `${backendCallback}?frontend_redirect=${encodeURIComponent(finalCallbackUrl)}`;
      
      // Redirect to worker with redirect_url parameter
      const workerAuthUrl = `${workerUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`;
      
      console.log('Frontend Callback:', finalCallbackUrl);
      console.log('Backend Callback:', backendCallback);
      console.log('Worker URL:', workerAuthUrl);
      window.location.href = workerAuthUrl;
      
    } catch (error) {
      console.error('Google login error:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to initiate Google login');
      }
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md w-full max-w-md"
    >
      {/* Google Logo SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10V12.05H15.5091C15.2636 13.3 14.5727 14.3591 13.5409 15.0682V17.5773H16.8182C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z"
          fill="#4285F4"
        />
        <path
          d="M10 20C12.7 20 14.9636 19.1045 16.8182 17.5773L13.5409 15.0682C12.6545 15.6682 11.5273 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2636 4.40455 11.9H0.995455V14.4909C2.83636 18.1409 6.13182 20 10 20Z"
          fill="#34A853"
        />
        <path
          d="M4.40455 11.9C4.20455 11.3 4.09091 10.6591 4.09091 10C4.09091 9.34091 4.20455 8.7 4.40455 8.1V5.50909H0.995455C0.318182 6.85909 0 8.38636 0 10C0 11.6136 0.318182 13.1409 0.995455 14.4909L4.40455 11.9Z"
          fill="#FBBC05"
        />
        <path
          d="M10 3.97727C11.6682 3.97727 13.1545 4.53182 14.3273 5.64091L17.2364 2.73182C14.9591 0.59091 12.6955 0 10 0C6.13182 0 2.83636 1.85909 0.995455 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z"
          fill="#EA4335"
        />
      </svg>
      
      <span className="text-gray-700 font-medium">
        Continue with Google
      </span>
    </button>
  );
};

export default GoogleLoginButton;
