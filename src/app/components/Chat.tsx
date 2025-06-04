'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, X, ChevronLeft, ChevronRight, Bot, User } from 'lucide-react';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import { useRouter } from 'next/navigation';
import { Message, ChatContext } from '@/types/chat';
import { findSimilarConversations, debounce, isAskingForDirectAnswer, getLearningObjectives } from '@/lib/chatUtils';

interface ChatProps {
  context?: ChatContext;
  isFullScreen?: boolean;
}

const components: Components = {
  code({inline, className, children, ...props}: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
};

export default function Chat({ context, isFullScreen = false }: ChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSimilarChats, setShowSimilarChats] = useState(false);
  const [similarChats, setSimilarChats] = useState<{ contextKey: string; similarity: number; messages: Message[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [contextInfo, setContextInfo] = useState<any>(null);

  // Generate a unique key for the current page context
  const getContextKey = (ctx?: ChatContext): string => {
    if (!ctx) return 'global-chat';
    if (ctx.type === 'dashboard') return 'dashboard';
    return `${ctx.type}-${ctx.id || 'unknown'}`;
  };

  const contextKey = getContextKey(context);

  // Load context information for better assistance
  useEffect(() => {
    if (context?.id && context?.type) {
      mockCanvasApi.getContextInfo(context.type, context.id).then(info => {
        setContextInfo(info);
      }).catch(error => {
        console.error('Error loading context info:', error);
      });
    }
  }, [context]);

  // Load page-specific chat history from localStorage - FRESH START PER PAGE
  useEffect(() => {
    const loadPageChatHistory = () => {
      // Always start fresh - clear any existing messages
      setMessages([]);
      setIsInitialized(true);
    };

    loadPageChatHistory();
  }, [contextKey]);

  // Save page-specific messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && isInitialized) {
      const savedChats = localStorage.getItem('pageSpecificChats');
      const allChats = savedChats ? JSON.parse(savedChats) : {};
      
      // Convert timestamps to ISO strings for storage
      const messagesToSave = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));
      
      allChats[contextKey] = messagesToSave;
      localStorage.setItem('pageSpecificChats', JSON.stringify(allChats));

      // Also update the global chat history for the chat history page
      const globalHistory = localStorage.getItem('chatHistory');
      const existingGlobalMessages = globalHistory ? JSON.parse(globalHistory) : [];
      
      // Remove old messages for this context from global history
      const filteredGlobalMessages = existingGlobalMessages.filter((msg: Message) => {
        if (!msg.context || !context) return true;
        const msgKey = getContextKey(msg.context);
        return msgKey !== contextKey;
      });

      // Add current messages to global history
      const updatedGlobalMessages = [...filteredGlobalMessages, ...messagesToSave];
      localStorage.setItem('chatHistory', JSON.stringify(updatedGlobalMessages));
    }
  }, [messages, isInitialized, contextKey, context]);

  // Initialize chat with context-aware welcome message
  useEffect(() => {
    if (context && isInitialized && messages.length === 0) {
      const getWelcomeMessage = () => {
        if (context.type === 'course') {
          return `Hi! I'm here to help you with ${context.title || 'this course'}. I can assist with assignments, explain concepts, help with study planning, or answer questions about course content. What would you like to know?`;
        } else if (context.type === 'assignment') {
          return `Hello! I'm ready to help you with "${context.title || 'this assignment'}". I can explain requirements, suggest approaches, help break down the work, or clarify any concepts. How can I assist you?`;
        } else if (context.type === 'calendar') {
          return `Hi there! I can help you with your calendar and schedule. I can remind you about upcoming deadlines, help you plan your time, suggest study schedules, or answer questions about your assignments and events. What do you need help with?`;
        } else if (context.type === 'dashboard') {
          return `Welcome! I'm your learning assistant. I can help you with any of your courses, assignments, study planning, or answer questions about your academic progress. I have access to all your course information. How can I help you today?`;
        }
        return `Hello! I'm your learning assistant. How can I help you today?`;
      };

      const initialMessage: Message = {
        id: Date.now().toString(),
        content: getWelcomeMessage(),
        role: 'assistant',
        timestamp: new Date(),
        context
      };
      setMessages([initialMessage]);
    }
  }, [context, isInitialized, messages.length]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debounced search for similar conversations
  const searchSimilarConversations = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setShowSimilarChats(false);
        return;
      }

      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        const allMessages = JSON.parse(savedMessages);
        const matches = findSimilarConversations(allMessages, query);
        if (matches) {
          setSimilarChats([matches]);
          setShowSimilarChats(true);
        } else {
          setShowSimilarChats(false);
        }
      }
    }, 500),
    []
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    searchSimilarConversations(value);
  };

  // Handle similar chat selection
  const handleSimilarChatSelect = (contextKey: string) => {
    setShowSimilarChats(false);
    setInput('');
    router.push(`/chat/${contextKey}`);
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter(message => 
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check for API key on mount and when chat opens
  useEffect(() => {
    const apiKey = localStorage.getItem('geminiApiKey');
    setHasApiKey(!!apiKey);
  }, []);

  const generateContextAwareResponse = async (userMessage: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Get comprehensive context information
      const courseData = await getComprehensiveContext(context);
      const searchResults = await mockCanvasApi.searchContent(userMessage, context);
      
      // Check for API key
      const apiKey = localStorage.getItem('geminiApiKey');
      if (!apiKey) {
        return "I need an API key to provide intelligent responses. Please set your Gemini API key in the settings.";
      }

      // Use Gemini 2.0 Flash for intelligent responses
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      // Build intelligent context-aware prompt
      const contextPrompt = buildEducationalPrompt(userMessage, courseData, context);
      
      const result = await model.generateContent(contextPrompt);
      const response = result.response;
      const text = response.text();
      
      return text;
      
    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm having trouble processing your request right now. Could you try rephrasing your question?";
    } finally {
      setIsLoading(false);
    }
  };

  // Build intelligent educational prompt for Gemini
  const buildEducationalPrompt = (userMessage: string, courseData: any, context?: ChatContext) => {
    let prompt = `You are an intelligent learning assistant for a university student. Your role is to help students learn and understand concepts, NOT to give direct answers or do their work for them.

CORE PRINCIPLES:
- Use the Socratic method - ask guiding questions to help students discover answers
- Explain concepts clearly but don't give away solutions
- Encourage critical thinking and problem-solving
- Maintain academic integrity - never do homework for students
- Be encouraging and supportive
- Keep responses concise but helpful

CURRENT CONTEXT:
`;

    // Add context-specific information
    if (context?.type === 'assignment' && courseData?.assignment) {
      const assignment = courseData.assignment;
      const course = courseData.course;
      
      prompt += `The student is currently working on an assignment:
- Assignment: "${assignment.name}"
- Course: ${course?.name || 'Unknown Course'}
- Due Date: ${new Date(assignment.due_at).toLocaleDateString()}
- Points: ${assignment.points_possible}
- Description: ${assignment.description?.substring(0, 300)}...

The student is asking about THIS SPECIFIC ASSIGNMENT.
`;
    } else if (context?.type === 'course' && courseData?.course) {
      const course = courseData.course;
      prompt += `The student is in the course "${course.name}" (${course.course_code}).
Instructor: ${course.instructor}
`;
      
      if (courseData.upcomingAssignments?.length > 0) {
        prompt += `\nUpcoming assignments:
`;
        courseData.upcomingAssignments.slice(0, 3).forEach((assignment: any) => {
          prompt += `- ${assignment.name} (Due: ${new Date(assignment.due_at).toLocaleDateString()})\n`;
        });
      }
    } else if (context?.type === 'dashboard') {
      if (courseData?.dashboard?.courses) {
        prompt += `The student is on their dashboard. Current courses: ${courseData.dashboard.courses.map((c: any) => c.name).join(', ')}.
`;
      }
    }

    prompt += `
CONVERSATION CONTEXT:
Student's question: "${userMessage}"

INSTRUCTIONS:
1. If they're asking for direct answers or solutions, redirect them to learning through guided questions
2. If they're struggling with concepts, break them down step by step
3. If they're on an assignment page, acknowledge the specific assignment they're working on
4. Use the context information to provide relevant, personalized help
5. Be encouraging and maintain a helpful, educational tone
6. Keep responses under 200 words when possible
7. Use bullet points for clarity when listing multiple items

Your response:`;

    return prompt;
  };

  // Get comprehensive context about the current course/assignment
  const getComprehensiveContext = async (context?: ChatContext) => {
    if (!context) return null;
    
    try {
      const data: any = { context };
      
      if (context.type === 'course' && context.id) {
        const course = await mockCanvasApi.getCourse(context.id);
        const assignments = await mockCanvasApi.getCourseAssignments(context.id);
        const modules = course?.modules || [];
        
        data.course = course;
        data.assignments = assignments;
        data.modules = modules;
        data.upcomingAssignments = assignments.filter(a => 
          a.status !== 'graded' && new Date(a.due_at) > new Date()
        );
        data.currentModule = modules.find((m: any) => !m.is_completed);
      } else if (context.type === 'assignment' && context.id) {
        const assignment = await mockCanvasApi.getAssignment(context.id);
        
        if (assignment) {
          data.assignment = assignment;
          // Get the course this assignment belongs to
          const dashboardData = await mockCanvasApi.getDashboardData();
          data.course = dashboardData?.courses?.find((c: any) => 
            c.id === assignment.course_id
          );
        }
      } else if (context.type === 'dashboard') {
        data.dashboard = await mockCanvasApi.getDashboardData();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting comprehensive context:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
      context
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSimilarChats(false);
    
    try {
      const response = await generateContextAwareResponse(input.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        context
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat submission:', error);
      setDebugInfo(prev => `${prev}\nError in chat submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, there was an error processing your request. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
        context
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isFullScreen) {
    return (
      <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-md space-x-2 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-3 h-3 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 text-white" />
                  )}
                </div>
                <div
                  className={`px-3 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          {debugInfo && (
            <div className="flex justify-center my-2">
              <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg max-w-md w-full font-mono text-xs">
                <details>
                  <summary className="cursor-pointer text-xs">Debug Info</summary>
                  <pre className="whitespace-pre-wrap mt-1 text-xs">{debugInfo}</pre>
                </details>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-gray-200 p-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about ${context?.title || 'anything'}...`}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full screen chat view (for dedicated chat pages)
  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {context?.title || 'Chat Assistant'}
            </h1>
            <p className="text-sm text-gray-600">
              {context?.type === 'course' && 'Course Assistant'}
              {context?.type === 'assignment' && 'Assignment Help'}
              {context?.type === 'dashboard' && 'General Learning Assistant'}
              {context?.type === 'calendar' && 'Schedule Assistant'}
              {!context && 'Learning Assistant'}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-2xl space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`px-6 py-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-6 py-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-6">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${context?.title || 'anything'}...`}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 