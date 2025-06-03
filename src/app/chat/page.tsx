'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Clock, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Message, ChatContext } from '@/types/chat';

interface ChatHistory {
  contextKey: string;
  context: ChatContext;
  lastMessage: Message;
  messageCount: number;
}

// Mock data for testing
const mockChatData: Message[] = [
  {
    id: '1',
    content: 'Can you help me understand the course requirements?',
    role: 'user',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    context: {
      type: 'course',
      id: 1,
      title: 'Introduction to Computer Science'
    }
  },
  {
    id: '2',
    content: 'I\'d be happy to help! The course covers fundamental programming concepts, data structures, and algorithms. You\'ll need to complete weekly assignments and a final project.',
    role: 'assistant',
    timestamp: new Date(Date.now() - 86390000),
    context: {
      type: 'course',
      id: 1,
      title: 'Introduction to Computer Science'
    }
  },
  {
    id: '3',
    content: 'What\'s the deadline for the first assignment?',
    role: 'user',
    timestamp: new Date(Date.now() - 43200000), // 12 hours ago
    context: {
      type: 'assignment',
      id: 1,
      title: 'Programming Basics Assignment'
    }
  },
  {
    id: '4',
    content: 'The first assignment is due next Friday at 11:59 PM. Make sure to submit your code through the course platform.',
    role: 'assistant',
    timestamp: new Date(Date.now() - 43190000),
    context: {
      type: 'assignment',
      id: 1,
      title: 'Programming Basics Assignment'
    }
  },
  {
    id: '5',
    content: 'How can I improve my study habits?',
    role: 'user',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    context: {
      type: 'dashboard',
      title: 'General Assistant'
    }
  },
  {
    id: '6',
    content: 'Here are some effective study strategies:\n1. Create a consistent study schedule\n2. Use active recall techniques\n3. Take regular breaks\n4. Review material regularly',
    role: 'assistant',
    timestamp: new Date(Date.now() - 3599000),
    context: {
      type: 'dashboard',
      title: 'General Assistant'
    }
  }
];

export default function ChatHistoryPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    const loadChatHistory = () => {
      console.log('Loading chat history...');
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        const messages: Message[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        console.log('Loaded messages:', messages);
        
        // Group messages by context
        const groupedMessages = messages.reduce((acc: { [key: string]: Message[] }, message) => {
          if (message.context) {
            // Handle dashboard case
            const key = message.context.type === 'dashboard' 
              ? 'dashboard-dashboard'
              : `${message.context.type}-${message.context.id}`;
            
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(message);
          }
          return acc;
        }, {});

        console.log('Grouped messages:', groupedMessages);

        // Create chat history entries
        const history = Object.entries(groupedMessages).map(([key, messages]) => {
          const lastMessage = messages[messages.length - 1];
          return {
            contextKey: key,
            context: lastMessage.context!,
            lastMessage,
            messageCount: messages.length
          };
        });

        // Sort by most recent
        history.sort((a, b) => 
          b.lastMessage.timestamp.getTime() - 
          a.lastMessage.timestamp.getTime()
        );

        console.log('Final chat history:', history);
        setChatHistory(history);
      }
    };

    loadChatHistory();
    // Refresh history every minute
    const interval = setInterval(loadChatHistory, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
        <Link
          href="/chat/new"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </Link>
      </div>

      {chatHistory.length > 0 ? (
        <div className="grid gap-4">
          {chatHistory.map((chat) => (
            <Link
              key={chat.contextKey}
              href={`/chat/${chat.contextKey}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {chat.context.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {chat.lastMessage.content.substring(0, 100)}
                    {chat.lastMessage.content.length > 100 ? '...' : ''}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span>{chat.messageCount} messages</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        {chat.lastMessage.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Chat History</h2>
          <p className="text-gray-600 mb-4">
            Start a new conversation to see it here.
          </p>
          <Link
            href="/chat/new"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Start New Chat</span>
          </Link>
        </div>
      )}
    </div>
  );
} 