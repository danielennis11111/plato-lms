/**
 * Layout Context for Multi-Chatbot Sidebar
 * 
 * Provides state management for:
 * - Chat sidebar open/close state
 * - Sidebar collapse state (if needed)
 * 
 * Usage:
 * 1. Wrap your entire app with LayoutProvider
 * 2. Use useLayout() hook in components that need chat state
 * 
 * Example:
 * <LayoutProvider>
 *   <YourApp />
 *   <EmbeddedChatButton />
 * </LayoutProvider>
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  isChatOpen: boolean;
  toggleChat: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <LayoutContext.Provider
      value={{
        isChatOpen,
        toggleChat,
        isSidebarCollapsed,
        toggleSidebar,
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