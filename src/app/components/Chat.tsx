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
import { useAuth, useAPIKey } from '@/contexts/AuthContext';
import { UserService } from '@/lib/userService';

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
  const { user, isAuthenticated, getUserData, updateUserData } = useAuth();
  const apiKey = useAPIKey('gemini');
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

  // Enhanced context detection for better page awareness
  const detectPageContext = (ctx?: ChatContext) => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const url = window.location.href;
      
      // Quiz page detection with state
      if (pathname.includes('/quiz/') || url.includes('quiz')) {
        const quizMatch = pathname.match(/\/courses\/[^\/]+\/quiz\/([^\/]+)/);
        if (quizMatch) {
          return {
            type: 'quiz' as const,
            id: ctx?.id,
            title: ctx?.title || 'Quiz',
            state: url.includes('/results') ? 'completed' : 'active',
            courseId: ctx?.courseId
          };
        }
      }
      
      // Assignment page detection with state
      if (pathname.includes('/assignments/')) {
        const assignmentMatch = pathname.match(/\/courses\/[^\/]+\/assignments\/([^\/]+)/);
        if (assignmentMatch) {
          return {
            type: 'assignment' as const,
            id: ctx?.id,
            title: ctx?.title || 'Assignment',
            state: 'active', // Could be enhanced to detect submission state
            courseId: ctx?.courseId
          };
        }
      }
      
      // Discussion page detection
      if (pathname.includes('/discussions/')) {
        const discussionMatch = pathname.match(/\/discussions\/(\d+)/);
        if (discussionMatch) {
          return {
            type: 'discussion' as const,
            id: parseInt(discussionMatch[1]),
            title: ctx?.title || 'Discussion',
            state: 'active',
            topic: ctx?.topic
          };
        }
      }
      
      // Course page detection
      if (pathname.includes('/courses/') && !pathname.includes('/assignments/') && !pathname.includes('/quiz/')) {
        const courseMatch = pathname.match(/\/courses\/([^\/]+)/);
        if (courseMatch) {
          return {
            type: 'course' as const,
            id: ctx?.id,
            title: ctx?.title || 'Course',
            state: 'active'
          };
        }
      }
      
      // Calendar page
      if (pathname.includes('/calendar')) {
        return {
          type: 'calendar' as const,
          state: 'active'
        };
      }
      
      // Dashboard page
      if (pathname === '/' || pathname.includes('/dashboard')) {
        return {
          type: 'dashboard' as const,
          state: 'active'
        };
      }
    }
    
    return ctx || { type: 'general' as const };
  };

  const enhancedContext = detectPageContext(context);

  // Generate a unique key for the current page context
  const getContextKey = (ctx?: ChatContext): string => {
    if (!ctx) return 'global-chat';
    if (ctx.type === 'dashboard') return 'dashboard';
    return `${ctx.type}-${ctx.id || 'unknown'}`;
  };

  const contextKey = getContextKey(enhancedContext);

  // Load context information for better assistance
  useEffect(() => {
    if (enhancedContext.id && enhancedContext.type) {
      mockCanvasApi.getContextInfo(enhancedContext.type, enhancedContext.id).then(info => {
        setContextInfo(info);
        
        // Auto-suggest discussion continuation for discussion contexts
        if (enhancedContext.type === 'discussion' && info && messages.length <= 1) {
          setTimeout(() => {
            const autoSuggestion = generateDiscussionContinuation(info);
            if (autoSuggestion) {
              const suggestionMessage: Message = {
                id: (Date.now() + 999).toString(),
                content: autoSuggestion,
                role: 'assistant',
                timestamp: new Date(),
                context: enhancedContext
              };
              setMessages(prev => [...prev, suggestionMessage]);
            }
          }, 2000); // Delay to let welcome message appear first
        }
      }).catch(error => {
        console.error('Error loading context info:', error);
      });
    }
  }, [enhancedContext, messages.length]);

  // Generate automatic discussion continuation based on recent comments
  const generateDiscussionContinuation = (discussionInfo: any) => {
    if (!discussionInfo?.replies || discussionInfo.replies.length === 0) return null;
    
    const recentReplies = discussionInfo.replies.slice(-2);
    const lastReply = recentReplies[recentReplies.length - 1];
    
    // Simulate a follow-up response based on the discussion topic
    const continuations = [
      `I noticed ${lastReply.author} mentioned some interesting points about ${discussionInfo.topic || 'this topic'}. Let me add a perspective from another classmate...`,
      `Building on the recent discussion, here's what another student might contribute to "${discussionInfo.title}"...`,
      `The conversation about ${discussionInfo.topic || 'this topic'} has some great momentum. Let me simulate how a classmate might respond to ${lastReply.author}'s comment...`
    ];
    
    return continuations[Math.floor(Math.random() * continuations.length)];
  };

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
        if (!msg.context || !enhancedContext) return true;
        const msgKey = getContextKey(msg.context);
        return msgKey !== contextKey;
      });

      // Add current messages to global history
      const updatedGlobalMessages = [...filteredGlobalMessages, ...messagesToSave];
      localStorage.setItem('chatHistory', JSON.stringify(updatedGlobalMessages));
    }
  }, [messages, isInitialized, contextKey, enhancedContext]);

  // Initialize welcome message based on context - only for authenticated users
  useEffect(() => {
    if (enhancedContext && isInitialized && messages.length === 0 && user) {
      const getWelcomeMessage = () => {
        if (enhancedContext.type === 'course') {
          return `Hello there, how can I help you explore ${enhancedContext.title || 'this course'}?`;
        } else if (enhancedContext.type === 'assignment') {
          return `Hello again, how can I help you work through this assignment?`;
        } else if (enhancedContext.type === 'quiz') {          
          if (enhancedContext.state === 'completed') {
            return `Hello there, how did that quiz go? What can we review together?`;
          } else {
            return `Hi there, let's go through this quiz together, but I can't actually give you any answers. Is that okay?`;
          }
        } else if (enhancedContext.type === 'discussion') {
          return `Hello there, how can I help you think through this discussion?`;
        } else if (enhancedContext.type === 'calendar') {
          return `Hello again, how can I help you organize your studies?`;
        } else if (enhancedContext.type === 'dashboard') {
          return `Hello there, what would you like to work on today?`;
        }
        return `Hello there, how can I help?`;
      };

      const initialMessage: Message = {
        id: Date.now().toString(),
        content: getWelcomeMessage(),
        role: 'assistant',
        timestamp: new Date(),
        context: enhancedContext
      };
      setMessages([initialMessage]);
    }
  }, [enhancedContext, isInitialized, messages.length, user]);

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

  // Test API key function
  const testApiKey = async () => {
    console.log('🔍 Testing API key...');
    console.log('📊 Debug - API key present:', !!apiKey);
    console.log('📊 Debug - API key length:', apiKey ? apiKey.length : 0);
    console.log('📊 Debug - API key first 10 chars:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');
    console.log('📊 Debug - User ID:', user?.id);
    console.log('📊 Debug - User name:', user?.name);
    console.log('📊 Debug - Is authenticated:', isAuthenticated);
    
    if (!apiKey) {
      setDebugInfo('No API key found. Please set your Gemini API key in Settings.');
      return;
    }
    
    try {
      console.log('🤖 Initializing Gemini with API key...');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      console.log('📤 Sending test request to Gemini...');
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: "Hello, can you verify this API key is working?" }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          }
        ]
      });
      
      const text = result.response.text();
      console.log('✅ API test successful:', text);
      setDebugInfo(`API Test: SUCCESS - ${text.substring(0, 50)}...`);
    } catch (error) {
      console.error('❌ API test failed:', error);
      console.error('❌ Error type:', error?.constructor?.name);
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      setDebugInfo(`API Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Test API key when it becomes available
  useEffect(() => {
    if (apiKey) {
      console.log('🔄 API key detected, running test...');
      testApiKey();
    } else {
      console.log('⚠️ No API key available');
      setDebugInfo('No API key available. Please set your Gemini API key in Settings.');
    }
  }, [apiKey]);

  // Check for API key on mount and when chat opens
  useEffect(() => {
    console.log('📝 Chat component state check:');
    console.log('  - API key status:', apiKey ? 'Found' : 'Missing');
    console.log('  - User:', user ? user.name : 'Not authenticated');
    console.log('  - Is authenticated:', isAuthenticated);
    
    // Also manually check the UserService
    if (user && isAuthenticated) {
      const manualApiKey = UserService.getActiveAPIKey(user.id, 'gemini');
      console.log('  - Manual API key check:', manualApiKey ? 'Found' : 'Not found');
      console.log('  - Manual vs hook match:', (manualApiKey === apiKey));
    }
  }, [apiKey, user, isAuthenticated]);

  const generateContextAwareResponse = async (userMessage: string): Promise<string> => {
    console.log('🚀 generateContextAwareResponse called with:', userMessage);
    setIsLoading(true);
    
    try {
      // Check if user is authenticated
      if (!user) {
        console.log('❌ User not authenticated');
        return "Please log in to access the AI tutoring features.";
      }

      // Get comprehensive context information
      const courseData = await getComprehensiveContext(enhancedContext);
      
      // Build search context for API
      const searchContext = enhancedContext.id ? {
        type: enhancedContext.type,
        id: enhancedContext.id
      } : undefined;
      
      const searchResults = await mockCanvasApi.searchContent(userMessage, searchContext);
      
      console.log('📊 Context data loaded:', { courseData, enhancedContext });
      
      // Check for API key
      console.log('🔑 API Key check:', apiKey ? 'Found' : 'Missing');
        
      if (!apiKey) {
        console.log('❌ No API key found');
        return "I need an API key to provide intelligent responses. Please set your Gemini API key in the settings.";
      }

      // Use Gemini 2.0 Flash for intelligent responses (same model as settings)
      console.log('🤖 Initializing Gemini...');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash", // Changed from gemini-2.0-flash-exp to match settings
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

      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Add the current user message
      conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      // Build the system instruction prompt
      const systemPrompt = buildEducationalPrompt(userMessage, courseData, enhancedContext, messages);
      console.log('📝 Built system prompt:', systemPrompt.substring(0, 200) + '...');
      
      console.log('🎯 Calling Gemini API with conversation history...');
      console.log('💬 Conversation length:', conversationHistory.length, 'messages');
      
      // Create the full conversation with system instruction
      const fullConversation = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...conversationHistory
      ];

      // Use the same API call format as the settings page
      const result = await model.generateContent({
        contents: fullConversation,
        generationConfig: {
          temperature: 0.7,
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
      
      const response = result.response;
      const text = response.text();

      console.log('✅ Gemini response received:', text.substring(0, 100) + '...');
      
      if (!text || text.trim().length === 0) {
        console.log('⚠️ Empty response from Gemini');
        return "I received an empty response. Could you try asking your question differently?";
      }
      
      return text;
      
    } catch (error) {
      console.error('❌ Error generating response:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let userFriendlyMessage = "I'm having trouble processing your request right now. Could you try rephrasing your question?";
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key')) {
          userFriendlyMessage = "There seems to be an issue with the API key. Please check your settings.";
        } else if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
          userFriendlyMessage = "API usage limit reached. Please try again in a moment.";
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          userFriendlyMessage = "Network connection issue. Please check your internet and try again.";
        } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
          userFriendlyMessage = "Your question was blocked by safety filters. Could you rephrase it?";
        }
      }
      
      setDebugInfo(`Gemini API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return userFriendlyMessage;
    } finally {
      setIsLoading(false);
    }
  };

  // Build intelligent educational prompt for Gemini
  const buildEducationalPrompt = (userMessage: string, courseData: any, context?: ChatContext, messages: Message[] = []) => {
    // Analyze conversation history for better context
    const conversationSummary = messages.length > 1 ? 
      `\n\nCONVERSATION CONTEXT:\nThis is a continuing conversation. Previous topics discussed: ${messages.slice(0, -1).map(msg => 
        msg.role === 'user' ? `Student asked: "${msg.content.substring(0, 100)}..."` : 
        `You responded about: "${msg.content.substring(0, 100)}..."`
      ).join('\n')}\n\nCurrent student question: "${userMessage}"\n` : 
      `\n\nSTUDENT'S CURRENT QUESTION: "${userMessage}"\n`;

    let prompt = `You are Socrates, a helpful AI tutor who uses strategic questions to guide learning. You're brilliant but act curious to encourage students to think deeper.

PERSONALITY:
- Be concise and direct (2-3 sentences max)
- Ask 1-2 focused questions per response
- Use simple language, not flowery or verbose 
- Act curious but practical: "How did you approach this?" not "I find myself wondering about the philosophical nature of..."
- Shield your intelligence - sound helpful, not pretentious
- Use exclamation points sparingly - only for genuine celebration or emphasis

APPROACH:
- Ask simple questions that reveal gaps in understanding
- When students struggle, break problems into smaller pieces
- Celebrate insights: "Good thinking!" or "That's right!"
- Use practical phrases: "What if..." "How about..." "Can you..." 
- Never lecture - always guide through questions

${context?.type === 'assignment' ? `
ASSIGNMENT HELP: Ask about their approach, then guide with practical questions to improve their work.
` : context?.type === 'quiz' ? `
QUIZ HELP: ${context?.state === 'completed' ? 'Ask what they learned from the experience.' : 'Ask questions to clarify concepts without giving answers.'}
` : context?.type === 'discussion' ? `
DISCUSSION HELP: Ask questions that encourage different perspectives and deeper thinking.
` : context?.type === 'calendar' || context?.type === 'dashboard' ? `
PLANNING HELP: Ask practical questions about priorities and study strategies.
` : `
GENERAL HELP: Listen to their needs and ask focused questions to guide learning.
`}

${conversationSummary}

Respond helpfully with 1-2 strategic questions:
`;

    return prompt;
  };

  // Get comprehensive context about the current course/assignment
  const getComprehensiveContext = async (context?: ChatContext) => {
    if (!context || !user) return null;
    
    try {
      const data: any = { context };
      
      // Get user enrollments for filtering
      const userData = getUserData();
      const userEnrollments = userData?.courseProgress ? Object.keys(userData.courseProgress) : [];
      
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
          // Get enrolled courses to find the course this assignment belongs to
          const courses = await mockCanvasApi.getCourses(userEnrollments);
          data.course = courses.find((c: any) => c.id === assignment.course_id);
        }
      } else if (context.type === 'dashboard') {
        data.dashboard = await mockCanvasApi.getDashboardData(userEnrollments);
      } else if (context.type === 'discussion' && context.id) {
        const discussion = await mockCanvasApi.getDiscussion(context.id);
        if (discussion) {
          data.discussion = discussion;
          // Get enrolled courses to find the course this discussion belongs to
          const courses = await mockCanvasApi.getCourses(userEnrollments);
          data.course = courses.find((c: any) => c.id === discussion.course_id);
        }
      } else {
        // For general context, get user's enrolled courses
        data.courses = await mockCanvasApi.getCourses(userEnrollments);
        data.dashboard = await mockCanvasApi.getDashboardData(userEnrollments);
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
      context: enhancedContext
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
        context: enhancedContext
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
        context: enhancedContext
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
                  message.role === 'user' ? 'bg-blue-500' : 'bg-transparent'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-3 h-3 text-white" />
                  ) : (
                    <img 
                      src="/socrates-avatar.png" 
                      alt="Socrates AI" 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                </div>
                <div
                  className={`px-3 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="text-xs leading-relaxed prose prose-xs max-w-none">
                      <ReactMarkdown components={components}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
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
          {/* Debug info - always visible for now */}
          <div className="flex justify-center my-2">
            <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg max-w-md w-full font-mono text-xs">
              <details open>
                <summary className="cursor-pointer text-xs">Debug Info</summary>
                <pre className="whitespace-pre-wrap mt-1 text-xs">
                  {debugInfo || 'Initializing...'}
                  {'\n'}API Key: {apiKey ? 'Set' : 'Missing'}
                  {'\n'}Context: {JSON.stringify(enhancedContext, null, 2)}
                </pre>
              </details>
            </div>
          </div>
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-gray-200 p-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about ${enhancedContext?.title || 'anything'}...`}
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
              Dialogue with Socrates
            </h1>
            <p className="text-sm text-gray-600">
              {enhancedContext?.type === 'course' && 'Course Dialogue'}
              {enhancedContext?.type === 'assignment' && 'Assignment Guidance'}
              {enhancedContext?.type === 'quiz' && (enhancedContext?.state === 'completed' ? 'Quiz Review & Reflection' : 'Quiz Concept Help')}
              {enhancedContext?.type === 'discussion' && 'Discussion Facilitation'}
              {enhancedContext?.type === 'dashboard' && 'General Learning Dialogue'}
              {enhancedContext?.type === 'calendar' && 'Time & Learning Dialogue'}
              {!enhancedContext && 'Learning Dialogue'}
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
                message.role === 'user' ? 'bg-blue-500' : 'bg-transparent'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <img 
                    src="/socrates-avatar.png" 
                    alt="Socrates AI" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
              </div>
              <div
                className={`px-6 py-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="text-xs leading-relaxed prose prose-xs max-w-none">
                    <ReactMarkdown components={components}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
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
            placeholder={`Ask about ${enhancedContext?.title || 'anything'}...`}
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