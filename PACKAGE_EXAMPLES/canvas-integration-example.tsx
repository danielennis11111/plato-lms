/**
 * Example: Canvas LMS Page with Multi-Chatbot Integration
 * 
 * This example shows how to integrate the chatbot sidebar with a Canvas-style page
 * that properly responds to the chat width when the sidebar is open.
 */

'use client';

import { useState } from 'react';
import { useLayout } from '../contexts/LayoutContext'; // Adjust import path
import { Book, Calendar, MessageSquare, User, Bell, Search, Menu } from 'lucide-react';
import EmbeddedChatButton from '../components/EmbeddedChatButton'; // Adjust import path

export default function CanvasPageExample() {
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const { isChatOpen } = useLayout(); // 🔑 Key: Get chat state for responsive layout

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Menu },
    { id: 'courses', label: 'Courses', icon: Book },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#353535] text-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#8C1D40] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">LMS</span>
              </div>
              <span className="font-semibold">Your LMS</span>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPage(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm transition-colors
                      ${selectedPage === item.id 
                        ? 'bg-white/10 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-300 hover:text-white rounded-md hover:bg-white/5">
              <Search size={18} />
            </button>
            <button className="p-2 text-gray-300 hover:text-white rounded-md hover:bg-white/5 relative">
              <Bell size={18} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFC425] rounded-full"></div>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">JS</span>
              </div>
              <span className="text-sm hidden sm:inline">John Smith</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - 🔑 Key: Responsive margin for chat sidebar */}
      <div className="flex min-h-screen">
        <main 
          className="flex-1 p-6 transition-all duration-300 ease-in-out"
          style={{
            // 🔑 This is the key integration: margin adjusts based on chat state
            marginRight: isChatOpen ? '520px' : '0px' // 500px sidebar + 20px margin
          }}
        >
          {selectedPage === 'dashboard' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome! Your AI assistants are available via the chat button.</p>
              </div>

              {/* Content Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { title: 'Course 1', description: 'Introduction to Programming', color: 'bg-blue-500' },
                  { title: 'Course 2', description: 'Data Structures', color: 'bg-green-500' },
                  { title: 'Course 3', description: 'Web Development', color: 'bg-purple-500' }
                ].map((course, index) => (
                  <div key={index} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <div className={`${course.color} h-3 rounded-t-lg`}></div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Demo Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-1">🤖 AI Assistant Integration</h3>
                <p className="text-sm text-blue-700">
                  Click the chat button to access multiple AI assistants. Use the dropdown to switch between different specialized assistants.
                  Notice how the page content automatically adjusts its width when the chat sidebar is open.
                </p>
              </div>
            </div>
          )}

          {/* Other page content... */}
          {selectedPage !== 'dashboard' && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{selectedPage}</h1>
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <p className="text-gray-600">{selectedPage} content would go here.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 🔑 Key: Add the chatbot component */}
      <EmbeddedChatButton />
    </div>
  );
} 