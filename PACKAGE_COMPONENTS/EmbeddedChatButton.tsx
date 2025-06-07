/**
 * Multi-Chatbot Sidebar Component
 * 
 * Features:
 * - Profile switching between multiple chatbots
 * - Performance optimized (only loads selected chatbot)
 * - Responsive design with mobile support
 * - Content width integration
 * 
 * Dependencies:
 * - lucide-react (icons)
 * - tailwindcss (styling)
 * - LayoutContext (must be imported)
 * 
 * Usage:
 * 1. Import and wrap app with LayoutProvider
 * 2. Add this component anywhere in your layout
 * 3. Configure chatbotProfiles array below
 * 4. Add content margin integration to main layout
 */

'use client';

import { useEffect, useState } from 'react';
import { X, MessageSquare, ExternalLink, RefreshCw, ChevronDown, Bot } from 'lucide-react';
import { useLayout } from '../contexts/LayoutContext'; // Adjust import path as needed

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

  // 🔧 CONFIGURATION: Add your chatbot profiles here
  // To add more chatbots: Add new objects to this array with unique IDs, custom names, URLs, and descriptions
  const chatbotProfiles: ChatbotProfile[] = [
    {
      id: 'default',
      name: 'AI Assistant',
      url: 'https://app-beta.aiml.asu.edu/2afee586704c45fda29aea2eff30b485',
      description: 'General AI Assistant'
    },
    {
      id: 'tutor',
      name: 'AI Tutor',
      url: 'https://app-beta.aiml.asu.edu/2afee586704c45fda29aea2eff30b485',
      description: 'Specialized tutoring assistant'
    },
    {
      id: 'research',
      name: 'Research Helper',
      url: 'https://app-beta.aiml.asu.edu/2afee586704c45fda29aea2eff30b485',
      description: 'Research and citation assistant'
    },
    {
      id: 'writing',
      name: 'Writing Coach',
      url: 'https://app-beta.aiml.asu.edu/2afee586704c45fda29aea2eff30b485',
      description: 'Writing improvement assistant'
    }
    // 👆 Add more chatbot profiles here
  ];

  const currentProfile = chatbotProfiles.find(p => p.id === selectedProfile) || chatbotProfiles[0];

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh the iframe by changing its key
  const refreshChatbot = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => setIsLoading(false), 2000);
  };

  // Open chatbot in new tab
  const openInNewTab = () => {
    window.open(currentProfile.url, '_blank', 'noopener,noreferrer');
  };

  // Handle profile selection
  const handleProfileSelect = (profileId: string) => {
    if (profileId !== selectedProfile) {
      setIsLoading(true);
      setSelectedProfile(profileId);
      setIframeKey(prev => prev + 1);
      setTimeout(() => setIsLoading(false), 2000);
    }
    setShowProfileDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileDropdown]);

  if (!mounted) return null;

  // 🎨 STYLING: Adjust sidebar width here
  const CHAT_WIDTH = 500;

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed ${isChatOpen ? `bottom-6 right-[${CHAT_WIDTH + 24}px]` : 'bottom-6 right-6'} p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-30 
          ${isChatOpen ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r from-[#8C1D40] to-[#FFC425] text-white hover:from-[#7a1936] hover:to-[#e6b022]'}`}
        style={{
          right: isChatOpen ? `${CHAT_WIDTH + 24}px` : '24px'
        }}
        aria-label={isChatOpen ? "Close AI Assistant" : "Open AI Assistant"}
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
              {/* Profile Switcher */}
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

                  {/* Profile Dropdown */}
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

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 ml-3">
                <button
                  onClick={refreshChatbot}
                  className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Refresh"
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={openInNewTab}
                  className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Open in new tab"
                >
                  <ExternalLink size={16} />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Info Banner */}
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

          {/* Embedded Chatbot */}
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleChat}
        />
      )}
    </>
  );
} 