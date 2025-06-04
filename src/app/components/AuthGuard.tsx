'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './auth/LoginForm';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Plato LMS</h1>
            <p className="text-gray-600 mt-2">Please login to continue</p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm text-center">
              <strong>Demo Access:</strong> Use the test accounts below to explore the platform
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 