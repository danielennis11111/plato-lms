# 🚀 Multi-Chatbot Sidebar Integration Package

## Quick Setup (15 minutes)

### 1. Install Dependency
```bash
npm install lucide-react
```

### 2. Create: `src/contexts/LayoutContext.tsx`
```tsx
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

  const toggleChat = () => setIsChatOpen(prev => !prev);
  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  return (
    <LayoutContext.Provider value={{ isChatOpen, toggleChat, isSidebarCollapsed, toggleSidebar }}>
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
```

### 3. Create: `src/components/EmbeddedChatButton.tsx`
```tsx
'use client';

import { useEffect, useState } from 'react';
import { X, MessageSquare, ExternalLink, RefreshCw, ChevronDown, Bot } from 'lucide-react';
import { useLayout } from '../contexts/LayoutContext';

interface ChatbotProfile {
  id: string;
  name: string;
  url: string;
  description?: string;
}

export default function EmbeddedChatButton() {
  const { isChatOpen, toggleChat } = useLayout();
  const [mounted, setMounted] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>('default');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // 🔧 CONFIGURE YOUR CHATBOTS HERE - Replace URLs with your actual chatbot URLs
  const chatbotProfiles: ChatbotProfile[] = [
    {
      id: 'default',
      name: 'AI Assistant',
      url: 'https://app-beta.aiml.asu.edu/2afee586704c45fda29aea2eff30b485', // Replace with your URL
      description: 'General AI Assistant'
    },
    {
      id: 'tutor',
      name: 'AI Tutor',
      url: 'https://app-beta.aiml.asu.edu/2afee586704c45fda29aea2eff30b485', // Replace with your URL
      description: 'Specialized tutoring assistant'
    },
    {
      id: 'research',
      name: 'Research Helper',
      url: 'https://app-beta.aiml.asu.edu/2afee586704c45fda29aea2eff30b485', // Replace with your URL
      description: 'Research and citation assistant'
    }
    // Add more chatbots as needed
  ];

  const currentProfile = chatbotProfiles.find(p => p.id === selectedProfile) || chatbotProfiles[0];

  useEffect(() => setMounted(true), []);

  const refreshChatbot = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const openInNewTab = () => window.open(currentProfile.url, '_blank', 'noopener,noreferrer');

  const handleProfileSelect = (profileId: string) => {
    if (profileId !== selectedProfile) {
      setIsLoading(true);
      setSelectedProfile(profileId);
      setIframeKey(prev => prev + 1);
      setTimeout(() => setIsLoading(false), 2000);
    }
    setShowProfileDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileDropdown]);

  if (!mounted) return null;

  const CHAT_WIDTH = 500;

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-30 
          ${isChatOpen ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r from-[#8C1D40] to-[#FFC425] text-white hover:from-[#7a1936] hover:to-[#e6b022]'}`}
        style={{ right: isChatOpen ? `${CHAT_WIDTH + 24}px` : '24px', bottom: '24px' }}
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Panel */}
      <div 
        className={`fixed right-0 top-0 h-screen bg-white border-l border-gray-200 shadow-xl z-20 transition-all duration-300 ease-in-out
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: `${CHAT_WIDTH}px` }}
      >
        <div className="flex flex-col h-full">
          {/* Header with Profile Switcher */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#8C1D40] to-[#FFC425]">
            <div className="flex justify-between items-center">
              <div className="flex items-center flex-1">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white mr-3">
                  <Bot size={16} />
                </div>
                <div className="flex-1 relative profile-dropdown">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center justify-between w-full text-left bg-white/10 rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm">{currentProfile.name}</div>
                      {currentProfile.description && (
                        <div className="text-xs text-white/80">{currentProfile.description}</div>
                      )}
                    </div>
                    <ChevronDown size={16} className={`transform transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40">
                      {chatbotProfiles.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => handleProfileSelect(profile.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                            selectedProfile === profile.id ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                          }`}
                        >
                          <div className="font-medium text-sm">{profile.name}</div>
                          {profile.description && (
                            <div className="text-xs text-gray-500 mt-1">{profile.description}</div>
                          )}
                          {selectedProfile === profile.id && (
                            <div className="text-xs text-blue-600 mt-1 font-medium">Currently Active</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-3">
                <button onClick={refreshChatbot} className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors" disabled={isLoading}>
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button onClick={openInNewTab} className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                  <ExternalLink size={16} />
                </button>
                <button onClick={toggleChat} className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Profile Info */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Active: {currentProfile.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                {chatbotProfiles.length} assistant{chatbotProfiles.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-30">
              <div className="flex flex-col items-center">
                <RefreshCw size={24} className="animate-spin text-[#8C1D40] mb-2" />
                <p className="text-sm text-gray-600">Loading {currentProfile.name}...</p>
              </div>
            </div>
          )}

          {/* Chatbot Iframe */}
          <div className="flex-1 relative">
            <iframe
              key={`${selectedProfile}-${iframeKey}`}
              src={currentProfile.url}
              className="w-full h-full border-0"
              title={currentProfile.name}
              allow="microphone; camera; display-capture; autoplay; clipboard-write"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" onClick={toggleChat} />
      )}
    </>
  );
}
```

### 4. Wrap Your App with Provider

In your main layout file (e.g., `app/layout.tsx`):
```tsx
import { LayoutProvider } from './contexts/LayoutContext';
import EmbeddedChatButton from './components/EmbeddedChatButton';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <LayoutProvider>
          {children}
          <EmbeddedChatButton />
        </LayoutProvider>
      </body>
    </html>
  );
}
```

### 5. Optional: Make Content Responsive to Chat

For pages that should adjust when chat opens:
```tsx
import { useLayout } from '../contexts/LayoutContext';

export default function YourPage() {
  const { isChatOpen } = useLayout();
  
  return (
    <main 
      className="transition-all duration-300 ease-in-out"
      style={{ marginRight: isChatOpen ? '520px' : '0px' }}
    >
      {/* Your page content */}
    </main>
  );
}
```

## ✅ Testing Checklist

- [ ] Chat button appears in bottom right
- [ ] Clicking opens/closes sidebar  
- [ ] Profile dropdown shows all chatbots
- [ ] Switching profiles loads different chatbots
- [ ] Page content shifts when chat opens (if responsive integration added)
- [ ] Works on mobile (backdrop overlay)
- [ ] No console errors

## 🔧 Configuration

### Change Chatbot URLs
Edit the `chatbotProfiles` array in `EmbeddedChatButton.tsx` with your actual URLs.

### Change Colors  
Replace `#8C1D40` (maroon) and `#FFC425` (gold) with your brand colors.

### Change Sidebar Width
Modify `CHAT_WIDTH = 500` and update responsive margin accordingly.

## 🚨 Requirements

- React 18+ / Next.js 13+
- Tailwind CSS configured  
- lucide-react icons

## 🎯 What You Get

✅ Multi-chatbot profile switcher  
✅ Performance optimized (one iframe at a time)  
✅ Responsive design  
✅ Mobile friendly  
✅ Easy configuration  
✅ Custom branding ready  

That's it! The integration should work immediately with these files. 