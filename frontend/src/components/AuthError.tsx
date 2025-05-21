import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthErrorProps {
  error: string;
  onRetry?: () => void;
}

/**
 * A component to display authentication errors with options to retry or return to login
 */
const AuthError: React.FC<AuthErrorProps> = ({ error, onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md border-2 border-red-200 bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <div className="flex justify-center space-x-4">
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
              >
                Try Again
              </Button>
            )}
            <Button
              onClick={() => navigate('/login')}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
