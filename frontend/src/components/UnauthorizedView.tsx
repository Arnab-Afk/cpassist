import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnauthorizedViewProps {
  message?: string;
}

/**
 * A component to display when a user tries to access a protected route without authentication
 */
const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({ 
  message = "You need to be logged in to access this page"
}) => {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md border-2 border-border bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle size={48} className="text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-6 text-muted-foreground">{message}</p>
          <div className="flex justify-center">
            <Button asChild>
              <Link to="/login">
                Log In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedView;
