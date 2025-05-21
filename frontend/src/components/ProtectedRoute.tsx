import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { PageLoader } from './LoadingSpinner';
import UnauthorizedView from './UnauthorizedView';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

/**
 * A wrapper component that handles authentication state for protected routes
 * 
 * @param children - The components to render when authenticated
 * @param requireAuth - Whether authentication is required (default: true)
 */
export default function ProtectedRoute({ 
  children, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // For API calls or redirects that need state, use Navigate
    if (location.pathname !== '/login') {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    
    // For better UX, show unauthorized view
    return <UnauthorizedView />;
  }

  // If authentication is NOT required and user IS authenticated (like login page)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Default case: requirements are met, show the children
  return <>{children}</>;
}
