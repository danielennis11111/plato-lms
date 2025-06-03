'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '@/app/components/Chat';
import { Message, ChatContext } from '@/types/chat';
import { mockCanvasApi } from '@/lib/mockCanvasApi';

export default function ChatSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChatSession = async () => {
      console.log('Loading chat session for ID:', params.id);
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        const messages: Message[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        console.log('Loaded messages:', messages);

        // Handle dashboard case separately
        if (params.id === 'dashboard-dashboard') {
          const dashboardMessages = messages.filter(msg => 
            msg.context && msg.context.type === 'dashboard'
          );
          console.log('Dashboard messages:', dashboardMessages);
          if (dashboardMessages.length > 0) {
            setChatContext(dashboardMessages[0].context!);
            setIsLoading(false);
            return;
          }
        } else {
          const sessionMessages = messages.filter(msg => 
            msg.context && `${msg.context.type}-${msg.context.id || 'dashboard'}` === params.id
          );
          console.log('Session messages:', sessionMessages);
          if (sessionMessages.length > 0) {
            setChatContext(sessionMessages[0].context!);
            setIsLoading(false);
            return;
          }
        }
      }

      // If no existing messages, create new context
      const [type, id] = params.id.split('-');
      console.log('Creating new context for type:', type, 'id:', id);
      let context: ChatContext;

      try {
        switch (type) {
          case 'course': {
            const course = await mockCanvasApi.getCourse(parseInt(id));
            if (!course) throw new Error('Course not found');
            context = {
              type: 'course',
              id: course.id,
              title: course.name
            };
            break;
          }
          case 'assignment': {
            const assignment = await mockCanvasApi.getAssignments().then(assignments => 
              assignments.find(a => a.id === parseInt(id))
            );
            if (!assignment) throw new Error('Assignment not found');
            context = {
              type: 'assignment',
              id: assignment.id,
              title: assignment.name
            };
            break;
          }
          case 'dashboard':
            context = {
              type: 'dashboard',
              title: 'General Assistant'
            };
            break;
          default:
            throw new Error('Invalid chat type');
        }

        console.log('Created new context:', context);
        setChatContext(context);
      } catch (error) {
        console.error('Error loading chat context:', error);
        router.push('/chat');
      } finally {
        setIsLoading(false);
      }
    };

    loadChatSession();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chatContext) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Chat Not Found</h1>
        <p className="text-gray-600 mb-8">The chat session you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/chat')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Chat History
        </button>
      </div>
    );
  }

  return <Chat context={chatContext} isFullScreen={true} />;
} 