'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🔒 Access denied: User not authenticated, redirecting to login');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  React.useEffect(() => {
    // Additional check: Verify user has valid session data
    if (!isLoading && isAuthenticated && !user) {
      console.log('🔒 Invalid session: No user data found, redirecting to login');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
          <p className="text-gray-300">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 