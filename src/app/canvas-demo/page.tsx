'use client';

import { useState } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { Book, Calendar, MessageSquare, User, Bell, Search, Menu } from 'lucide-react';

export default function CanvasDemoPage() {
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const { isChatOpen } = useLayout();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Menu },
    { id: 'courses', label: 'Courses', icon: Book },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Canvas-like Header */}
      <header className="bg-[#353535] text-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#8C1D40] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">ASU</span>
              </div>
              <span className="font-semibold">Canvas</span>
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
                <span className="text-sm font-medium">DE</span>
              </div>
              <span className="text-sm hidden sm:inline">Daniel Ennis</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Chat-Responsive Width */}
      <div className="flex min-h-screen">
        {/* Main Content with dynamic margin for chat */}
        <main 
          className="flex-1 p-6 transition-all duration-300 ease-in-out"
          style={{
            marginRight: isChatOpen ? '520px' : '0px'
          }}
        >
          {selectedPage === 'dashboard' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening in your courses.</p>
              </div>

              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[#8C1D40] to-[#FFC425] rounded-lg p-6 text-white mb-6">
                <h2 className="text-xl font-semibold mb-2">Welcome to ASU Canvas!</h2>
                <p className="text-white/90">
                  Your AI assistant is now available. Click the chat button to get help with your coursework.
                </p>
              </div>

              {/* Course Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    id: 'cse110',
                    name: 'Introduction to Programming',
                    code: 'CSE 110',
                    instructor: 'Dr. Smith',
                    color: 'bg-blue-500',
                    assignments: 3,
                    announcements: 1
                  },
                  {
                    id: 'mat210',
                    name: 'Calculus for Engineers',
                    code: 'MAT 210',
                    instructor: 'Prof. Johnson',
                    color: 'bg-green-500',
                    assignments: 2,
                    announcements: 0
                  },
                  {
                    id: 'eng101',
                    name: 'First-Year Composition',
                    code: 'ENG 101',
                    instructor: 'Dr. Williams',
                    color: 'bg-purple-500',
                    assignments: 1,
                    announcements: 2
                  }
                ].map((course) => (
                  <div key={course.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <div className={`${course.color} h-3 rounded-t-lg`}></div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{course.code} • {course.instructor}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{course.assignments} assignments due</span>
                        <span>{course.announcements} new announcements</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {[
                    {
                      type: 'assignment',
                      course: 'CSE 110',
                      title: 'Programming Assignment 3',
                      action: 'submitted',
                      time: '2 hours ago'
                    },
                    {
                      type: 'discussion',
                      course: 'ENG 101',
                      title: 'Literary Analysis Discussion',
                      action: 'posted in',
                      time: '1 day ago'
                    },
                    {
                      type: 'quiz',
                      course: 'MAT 210',
                      title: 'Derivatives Quiz',
                      action: 'completed',
                      time: '2 days ago'
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'assignment' ? 'bg-blue-500' :
                        activity.type === 'discussion' ? 'bg-purple-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span> {activity.title} in{' '}
                          <span className="font-medium">{activity.course}</span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedPage === 'courses' && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Courses</h1>
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <p className="text-gray-600">Course management interface would be here.</p>
              </div>
            </div>
          )}

          {selectedPage === 'calendar' && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Calendar</h1>
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <p className="text-gray-600">Calendar interface would be here.</p>
              </div>
            </div>
          )}

          {selectedPage === 'inbox' && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Inbox</h1>
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <p className="text-gray-600">Message interface would be here.</p>
              </div>
            </div>
          )}

          {selectedPage === 'account' && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <p className="text-gray-600">Account settings would be here.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Demo Notice */}
      <div className="fixed bottom-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
        <h3 className="font-medium text-blue-900 mb-1">🎯 Demo Active</h3>
        <p className="text-sm text-blue-700">
          AI Assistant integration with profile switcher. Click the chat button and use the dropdown to switch between different assistants.
        </p>
      </div>
    </div>
  );
} 