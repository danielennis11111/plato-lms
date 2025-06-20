'use client';

import { useEffect, useState, useCallback } from 'react';
import { MessageCircle, X, MessageSquare } from 'lucide-react';
import Chat from './Chat';
import { useLayout } from '../contexts/LayoutContext';
import { usePathname } from 'next/navigation';
import { ChatContext } from '@/types/chat';
import { mockCanvasApi } from '@/lib/mockCanvasApi';

export default function ChatButton() {
  const { isChatOpen, toggleChat } = useLayout();
  const [mounted, setMounted] = useState(false);
  const [pageContext, setPageContext] = useState<ChatContext>({
    type: 'dashboard',
    title: 'Socrates - Your Learning Guide'
  });
  const pathname = usePathname();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine context based on current page path
  useEffect(() => {
    const getContextFromPath = async (): Promise<ChatContext> => {
      // Default context
      let context: ChatContext = {
        type: 'dashboard',
        title: 'Socrates - Your Learning Guide'
      };

      console.log('ChatButton: Current pathname:', pathname);

      // Course assignment page: /courses/[slug]/assignments/[assignmentSlug]
      if (pathname?.match(/^\/courses\/[^\/]+\/assignments\/[^\/]+$/)) {
        console.log('ChatButton: Detected assignment page');
        const pathParts = pathname.split('/');
        const courseSlug = pathParts[2];
        const assignmentSlug = pathParts[4];
        
        try {
          // Get course data first
          const courseData = await mockCanvasApi.getCourse(courseSlug);
          if (courseData) {
            // Get assignment data
            const assignmentData = await mockCanvasApi.getAssignmentByName(courseData.id, assignmentSlug);
            if (assignmentData) {
              context = {
                type: 'assignment',
                id: assignmentData.id,
                title: assignmentData.name
              };
              console.log('ChatButton: Set assignment context:', context);
            }
          }
        } catch (error) {
          console.error('ChatButton: Error fetching assignment context:', error);
        }
      }
      // Course page: /courses/[slug]
      else if (pathname?.match(/^\/courses\/[^\/]+$/)) {
        console.log('ChatButton: Detected course page');
        const courseSlug = pathname.split('/')[2];
        try {
          const courseData = await mockCanvasApi.getCourse(courseSlug);
          if (courseData) {
            context = {
              type: 'course',
              id: courseData.id,
              title: courseData.name
            };
            console.log('ChatButton: Set course context:', context);
          }
        } catch (error) {
          console.error('ChatButton: Error fetching course context:', error);
        }
      }
      // Quiz page: /courses/[slug]/quizzes/[quizSlug]
      else if (pathname?.match(/^\/courses\/[^\/]+\/quizzes\/[^\/]+$/)) {
        console.log('ChatButton: Detected quiz page');
        const pathParts = pathname.split('/');
        const courseSlug = pathParts[2];
        const quizSlug = pathParts[4];
        
        try {
          const courseData = await mockCanvasApi.getCourse(courseSlug);
          if (courseData) {
            const quizData = await mockCanvasApi.getQuizByName(courseData.id, quizSlug);
            if (quizData) {
              context = {
                type: 'assignment', // Treat quizzes as assignments for chat purposes
                id: quizData.id,
                title: quizData.name
              };
              console.log('ChatButton: Set quiz context:', context);
            }
          }
        } catch (error) {
          console.error('ChatButton: Error fetching quiz context:', error);
        }
      }
      // Discussion page: /courses/[slug]/discussions/[discussionSlug]
      else if (pathname?.match(/^\/courses\/[^\/]+\/discussions\/[^\/]+$/)) {
        console.log('ChatButton: Detected discussion page');
        const pathParts = pathname.split('/');
        const courseSlug = pathParts[2];
        const discussionSlug = pathParts[4];
        
        try {
          // Check if there's a stored discussion context
          const storedDiscussionContext = localStorage.getItem('currentDiscussionContext');
          if (storedDiscussionContext) {
            const parsedContext = JSON.parse(storedDiscussionContext);
            context = {
              type: 'discussion',
              id: parsedContext.id,
              title: parsedContext.title,
              topic: parsedContext.topic,
              state: 'active'
            };
            console.log('ChatButton: Set discussion context from stored data:', context);
          } else {
            // Fallback to basic discussion context
            context = {
              type: 'discussion',
              title: 'Socrates - Discussion Guide',
              state: 'active'
            };
          }
        } catch (error) {
          console.error('ChatButton: Error setting discussion context:', error);
          context = {
            type: 'discussion',
            title: 'Socrates - Discussion Guide'
          };
        }
      }
      // Calendar page
      else if (pathname?.includes('/calendar')) {
        context = {
          type: 'calendar',
          title: 'Socrates - Time & Learning Guide'
        };
      }
      // Courses list page
      else if (pathname?.includes('/courses')) {
        context = {
          type: 'dashboard',
          title: 'Socrates - Courses Guide'
        };
      }

      console.log('ChatButton: Final context:', context);
      return context;
    };

    getContextFromPath().then(setPageContext);

    // Listen for discussion context updates
    const handleDiscussionContextSet = (event: CustomEvent) => {
      console.log('ChatButton: Discussion context updated', event.detail);
      // Refresh the context when discussion persona is selected
      getContextFromPath().then(setPageContext);
    };

    window.addEventListener('discussionContextSet', handleDiscussionContextSet as EventListener);
    
    return () => {
      window.removeEventListener('discussionContextSet', handleDiscussionContextSet as EventListener);
    };
  }, [pathname]);

  if (!mounted) return null;

  const CHAT_WIDTH = 500; // Increased width for better readability

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
        aria-label={isChatOpen ? "Close dialogue" : "Open dialogue with Socrates"}
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
          <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-2">
                <MessageCircle size={14} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Socrates</h2>
                <p className="text-xs text-gray-500">
                  {pageContext?.title ? `Dialogue: ${pageContext.title}` : 'Begin a dialogue about your learning'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              aria-label="Close dialogue"
            >
              <X size={16} />
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