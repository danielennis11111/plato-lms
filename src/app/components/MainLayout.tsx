'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import AuthGuard from './AuthGuard';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isSidebarCollapsed, isChatOpen } = useLayout();
  const [mounted, setMounted] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Handle hydration mismatch and initialize screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    // Check initial size
    checkScreenSize();
    setMounted(true);
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Prevent hydration mismatch by rendering a basic layout initially
  if (!mounted) {
    return (
      <AuthGuard>
        <main className="flex-1 h-full overflow-auto p-4 sm:p-6 md:p-8">
          <div className="opacity-0">
            {children}
          </div>
        </main>
      </AuthGuard>
    );
  }
  
  // Generate CSS classes based on state
  const getMainClasses = () => {
    const baseClasses = "flex-1 h-full overflow-auto transition-all duration-300 ease-in-out";
    
    if (isSmallScreen) {
      return `${baseClasses} p-4`;
    }
    
    // Desktop layout with proper spacing for all combinations
    let spacing = "";
    
    // Handle all sidebar + chat combinations
    if (isSidebarCollapsed && !isChatOpen) {
      // Both collapsed - centered with auto margins
      spacing = "mx-auto my-6";
    } else if (isSidebarCollapsed && isChatOpen) {
      // Sidebar collapsed, chat open
      spacing = "ml-16 mr-[520px] w-[calc(100vw-4rem-520px)] min-w-0";
    } else if (!isSidebarCollapsed && !isChatOpen) {
      // Sidebar expanded, chat closed
      spacing = "ml-64 mr-0 w-[calc(100vw-16rem)] min-w-0";
    } else {
      // Both expanded - sidebar expanded, chat open
      spacing = "ml-64 mr-[520px] w-[calc(100vw-16rem-520px)] min-w-0";
    }
    
    return `${baseClasses} ${spacing} p-6 md:p-8`;
  };
  
  return (
    <AuthGuard>
      <main className={getMainClasses()}>
        <div className="h-full max-w-full">
          {children}
        </div>
      </main>
    </AuthGuard>
  );
} 