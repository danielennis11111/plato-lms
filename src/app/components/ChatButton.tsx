'use client';

import { useEffect, useState, useCallback } from 'react';
import { MessageCircle, X, MessageSquare } from 'lucide-react';
import Chat from './Chat';
import { useLayout } from '../contexts/LayoutContext';
import { usePathname } from 'next/navigation';
import { ChatContext } from '@/types/chat';

export default function ChatButton() {
  const { isChatOpen, toggleChat } = useLayout();
  const [mounted, setMounted] = useState(false);
  const [pageContext, setPageContext] = useState<ChatContext>({
    type: 'dashboard',
    title: 'Learning Assistant'
  });
  const pathname = usePathname();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine context based on current page path
  useEffect(() => {
    const getContextFromPath = (): ChatContext => {
      // Default context
      let context: ChatContext = {
        type: 'dashboard',
        title: 'Learning Assistant'
      };

      // Course page: /courses/[id]
      if (pathname?.match(/^\/courses\/(\d+)$/)) {
        const id = parseInt(pathname.split('/').pop() || '0', 10);
        context = {
          type: 'course',
          id,
          title: `Course #${id}`
        };
      }
      // Course chat: /courses/[id]/chat
      else if (pathname?.match(/^\/courses\/(\d+)\/chat$/)) {
        const id = parseInt(pathname.split('/')[2] || '0', 10);
        context = {
          type: 'course',
          id,
          title: `Course #${id}`
        };
      }
      // Assignment page: /assignments/[id]
      else if (pathname?.match(/^\/assignments\/(\d+)$/)) {
        const id = parseInt(pathname.split('/').pop() || '0', 10);
        context = {
          type: 'assignment',
          id,
          title: `Assignment #${id}`
        };
      }
      // Chat page: /chat/[id]
      else if (pathname?.match(/^\/chat\/(\d+)$/)) {
        const id = parseInt(pathname.split('/').pop() || '0', 10);
        context = {
          type: 'dashboard', // Treat chat pages as dashboard type
          id,
          title: `Chat #${id}`
        };
      }

      return context;
    };

    setPageContext(getContextFromPath());
  }, [pathname]);

  if (!mounted) return null;

  const CHAT_WIDTH = 400; // Fixed width for the chat panel

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed ${isChatOpen ? `bottom-6 right-[${CHAT_WIDTH + 24}px]` : 'bottom-6 right-6'} p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-30 
          ${isChatOpen ? 'bg-gray-200 text-gray-700' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
        style={{
          right: isChatOpen ? `${CHAT_WIDTH + 24}px` : '24px'
        }}
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Panel */}
      <div 
        className={`fixed right-0 top-0 h-screen bg-white border-l border-gray-200 shadow-lg z-20 transition-all duration-300 ease-in-out
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: `${CHAT_WIDTH}px` }}
      >
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                <MessageCircle size={16} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Learning Assistant</h2>
                <p className="text-xs text-gray-500">
                  {pageContext?.title ? `Context: ${pageContext.title}` : 'Ask any question about your courses'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            {isChatOpen && (
              <Chat 
                context={pageContext}
                isFullScreen={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleChat}
        />
      )}
    </>
  );
} 