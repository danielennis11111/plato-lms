import React from 'react';
import Chat from './Chat';
import { ChatContext } from '@/types/chat';

interface LayoutProps {
  children: React.ReactNode;
  context?: ChatContext;
}

export default function Layout({ children, context }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </main>
        
        {/* Chat Sidebar - Always visible */}
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <h2 className="text-lg font-semibold text-blue-900">
              {context?.type === 'course' 
                ? `${context.title} Learning Assistant`
                : context?.type === 'assignment'
                ? 'Assignment Assistant'
                : 'AI Learning Assistant'}
            </h2>
            <p className="text-sm text-blue-700 mt-1">
              {context?.type === 'course'
                ? `Get help with ${context.title} concepts and assignments`
                : context?.type === 'assignment'
                ? 'Get guidance on your assignment'
                : 'Your personal learning companion'}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Chat context={context || { type: 'dashboard', title: 'Learning Assistant' }} />
          </div>
        </div>
      </div>
    </div>
  );
} 