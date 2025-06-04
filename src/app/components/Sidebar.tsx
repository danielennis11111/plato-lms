'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  ClipboardList,
  MessageSquare,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLayout } from '../contexts/LayoutContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Assignments', href: '/assignments', icon: ClipboardList },
    { name: 'Discussions', href: '/discussions', icon: MessageSquare },
    { name: 'Dialogues', href: '/chat', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar for larger screens */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out overflow-hidden
          ${isMobileMenuOpen ? 'w-64 translate-x-0' : isSidebarCollapsed ? 'w-16 -translate-x-full sm:translate-x-0' : 'w-64 -translate-x-full sm:translate-x-0'}`
        }
        style={{ 
          width: isMobileMenuOpen ? '256px' : isSidebarCollapsed ? '64px' : '256px'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`border-b border-gray-200 flex items-center ${isSidebarCollapsed ? 'justify-center p-4' : 'p-4 md:p-6 justify-center md:justify-start'}`}>
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-md flex items-center justify-center">
                <span className="font-bold">P</span>
              </div>
              {!isSidebarCollapsed && (
                <h1 className="ml-2 text-xl font-bold text-gray-900 hidden md:block">Plato</h1>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} p-3 rounded-lg transition-colors group relative
                        ${isActive
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                      {!isSidebarCollapsed && <span className="ml-3 hidden md:block truncate">{item.name}</span>}
                      
                      {/* Tooltip for collapsed state */}
                      {isSidebarCollapsed && (
                        <div className="absolute left-full rounded-md px-2 py-1 ml-2 bg-gray-900 text-white text-sm 
                                      opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Collapse/Expand button */}
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
} 