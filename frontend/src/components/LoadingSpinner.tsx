import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

/**
 * A reusable loading spinner component with customizable size and message
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-main ${sizeClasses[size]}`}></div>
      {message && <p className="mt-3 text-muted-foreground">{message}</p>}
    </div>
  );
};

/**
 * A full-page loading component with spinner and message
 */
export const PageLoader: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center">
        <LoadingSpinner size="lg" message={message} />
      </div>
    </div>
  );
};

export default LoadingSpinner;
