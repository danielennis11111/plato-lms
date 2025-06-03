'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useLayout } from '../contexts/LayoutContext';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isSidebarCollapsed, isChatOpen } = useLayout();
  const [mounted, setMounted] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Handle hydration mismatch and initialize screen size
  useEffect(() => {
    setMounted(true);
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    // Check initial size
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!mounted) return null;
  
  // Calculate margins and width based on sidebar and chat states
  const sidebarMargin = isSmallScreen ? 0 : (isSidebarCollapsed ? 64 : 256);
  const chatMargin = isSmallScreen ? 0 : (isChatOpen ? 400 : 0);
  
  return (
    <main 
      className="flex-1 h-full overflow-auto transition-all duration-300 ease-in-out"
      style={{
        marginLeft: `${sidebarMargin}px`,
        marginRight: `${chatMargin}px`,
        width: `calc(100% - ${sidebarMargin}px - ${chatMargin}px)`
      }}
    >
      <div className="p-4 sm:p-6 md:p-8 h-full">
        {children}
      </div>
    </main>
  );
} 