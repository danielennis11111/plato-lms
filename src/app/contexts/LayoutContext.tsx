'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  isChatOpen: boolean;
  setChatOpen: (value: boolean) => void;
  toggleSidebar: () => void;
  toggleChat: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage once mounted
  useEffect(() => {
    setMounted(true);
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState) {
      setSidebarCollapsed(savedSidebarState === 'true');
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
    }
  }, [isSidebarCollapsed, mounted]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleChat = () => {
    setChatOpen(!isChatOpen);
  };

  return (
    <LayoutContext.Provider
      value={{
        isSidebarCollapsed,
        setSidebarCollapsed,
        isChatOpen,
        setChatOpen,
        toggleSidebar,
        toggleChat
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
} 