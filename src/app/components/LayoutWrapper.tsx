'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutProvider } from '../contexts/LayoutContext';
import Sidebar from './Sidebar';
import MainLayout from './MainLayout';
import EmbeddedChatButton from './EmbeddedChatButton';

interface LayoutWrapperProps {
  children: ReactNode;
}

const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/canvas-demo'];

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const isPublicRoute = publicRoutes.includes(pathname);

  // Handle redirects for authentication
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        // User is not authenticated and trying to access a protected route
        console.log('🚫 Access denied, redirecting to login...');
        router.push('/auth/login');
      } else if (isAuthenticated && pathname === '/auth/login') {
        // User is authenticated but on login page, redirect to dashboard
        console.log('✅ User authenticated, redirecting to dashboard...');
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, isPublicRoute]);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Plato's Canvas...</p>
        </div>
      </div>
    );
  }

  // For public routes (like login), show minimal layout
  if (isPublicRoute) {
    // Special case for canvas-demo: include the chat component
    if (pathname === '/canvas-demo') {
      return (
        <LayoutProvider>
          <div className="min-h-screen bg-gray-50 relative">
            {children}
            <EmbeddedChatButton />
          </div>
        </LayoutProvider>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // For authenticated users, show full layout with sidebar
  if (isAuthenticated) {
    return (
      <LayoutProvider>
        <div className="flex min-h-screen bg-gray-50 relative">
          <Sidebar />
          <MainLayout>
            {children}
          </MainLayout>
          <EmbeddedChatButton />
        </div>
      </LayoutProvider>
    );
  }

  // For unauthenticated users trying to access protected routes
  // The useEffect above will handle the redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
} 