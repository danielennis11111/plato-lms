'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, X, ChevronLeft, ChevronRight, Bot, User, GitBranch, AlertTriangle, Info } from 'lucide-react';
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

interface SocratesPersonaOption {
  id: string;
  name: string;
  description: string;
  approach: string;
}

interface ConversationBranch {
  id: string;
  name: string;
  parentBranchId?: string;
  messages: Message[];
  createdAt: Date;
  summary?: string;
  tokenCount: number;
}

interface ContextMetrics {
  currentTokens: number;
  maxTokens: number;
  warningThreshold: number;
  criticalThreshold: number;
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
  const [throttleMessage, setThrottleMessage] = useState('');
  const [hasApiKey, setHasApiKey] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSimilarChats, setShowSimilarChats] = useState(false);
  const [similarChats, setSimilarChats] = useState<{ contextKey: string; similarity: number; messages: Message[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [contextInfo, setContextInfo] = useState<any>(null);
  const [showPersonaSelection, setShowPersonaSelection] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<SocratesPersonaOption | null>(null);
  const [discussionPersonas, setDiscussionPersonas] = useState<SocratesPersonaOption[]>([]);
  const [currentBranch, setCurrentBranch] = useState<ConversationBranch | null>(null);
  const [conversationBranches, setConversationBranches] = useState<ConversationBranch[]>([]);
  const [contextMetrics, setContextMetrics] = useState<ContextMetrics>({
    currentTokens: 0,
    maxTokens: 32000, // Gemini 2.0 Flash context limit
    warningThreshold: 24000, // 75%
    criticalThreshold: 28000 // 87.5%
  });
  const [showBranchManager, setShowBranchManager] = useState(false);

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
      
      // Discussion page detection - improved pattern matching
      if (pathname.includes('/discussions/')) {
        const discussionMatch = pathname.match(/\/discussions\/([^\/]+)/);
        if (discussionMatch) {
          return {
            type: 'discussion' as const,
            id: ctx?.id,
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

  // Token estimation function (rough approximation: 1 token ≈ 4 characters)
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  // Calculate total tokens for messages
  const calculateMessageTokens = (messages: Message[]): number => {
    return messages.reduce((total, msg) => total + estimateTokens(msg.content), 0);
  };

  // Create context summary for branch compression
  const createContextSummary = (messages: Message[]): string => {
    const userMessages = messages.filter(m => m.role === 'user');
    const topics = userMessages.map(m => m.content.substring(0, 100)).join('; ');
    return `Previous conversation covered: ${topics}. Key insights and progress made available for reference.`;
  };

  // Extract key information from conversation for context optimization
  const extractKeyInformation = (messages: Message[]): string => {
    const recentMessages = messages.slice(-6); // Last 6 messages for immediate context
    const userQuestions = recentMessages.filter(m => m.role === 'user').map(m => m.content);
    const keyTopics = [...new Set(userQuestions.flatMap(q => 
      q.split(/[.!?]/).filter(sentence => sentence.trim().length > 10)
    ))].slice(0, 3);
    
    return keyTopics.length > 0 ? `Key discussion points: ${keyTopics.join('; ')}.` : '';
  };

  // Optimize prompt for token efficiency
  const optimizeForTokenEfficiency = (basePrompt: string): string => {
    return basePrompt
      .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  // Generate Socrates personas based on discussion content
  const generateDiscussionPersonas = (discussionData: any, courseData: any) => {
    const personas: SocratesPersonaOption[] = [
      {
        id: 'classic-socrates',
        name: 'Classic Socrates',
        description: 'The original philosopher using the Socratic method',
        approach: 'Will ask probing questions to help you examine your assumptions and think more deeply about the topic.'
      },
      {
        id: 'discussion-moderator',
        name: 'Discussion Moderator',
        description: 'A skilled facilitator who synthesizes different viewpoints',
        approach: 'Will help connect ideas from different participants and guide the conversation forward.'
      }
    ];

    // Add course-specific expert - handle different info types
    const course = courseData?.course || (courseData?.course_code ? courseData : null);
    if (course?.course_code) {
      personas.push({
        id: 'subject-expert',
        name: `${course.course_code} Subject Expert`,
        description: `An expert in ${course.name} with deep knowledge`,
        approach: 'Will provide academic insights and connect discussion topics to course concepts.'
      });
    }

    // Add persona based on participants
    if (discussionData?.participants && discussionData.participants.length > 2) {
      personas.push({
        id: 'participant-simulator',
        name: 'Discussion Participant',
        description: 'Simulate continuing the conversation as one of the existing participants',
        approach: 'Will engage from the perspective of someone already involved in this discussion.'
      });
    }

    // Add topic-specific personas based on discussion content
    const discussionText = `${discussionData?.title || ''} ${discussionData?.originalPost?.message || ''} ${discussionData?.replies?.map((r: any) => r.message).join(' ') || ''}`.toLowerCase();
    
    if (discussionText.includes('ethic') || discussionText.includes('moral') || discussionText.includes('right') || discussionText.includes('wrong')) {
      personas.push({
        id: 'ethics-philosopher',
        name: 'Ethics Philosopher',
        description: 'Focused on moral reasoning and ethical implications',
        approach: 'Will explore the ethical dimensions and moral reasoning in your discussion.'
      });
    }

    if (discussionText.includes('debate') || discussionText.includes('argue') || discussionText.includes('disagree')) {
      personas.push({
        id: 'devils-advocate',
        name: "Devil's Advocate",
        description: 'Challenges ideas to strengthen arguments',
        approach: 'Will present counterarguments and alternative perspectives to test your reasoning.'
      });
    }

    return personas;
  };

  // Create a new conversation branch
  const createNewBranch = (branchName: string, fromMessage?: number) => {
    const branchId = `${contextKey}-branch-${Date.now()}`;
    const messagesToInclude = fromMessage !== undefined 
      ? messages.slice(0, fromMessage + 1)
      : messages;
    
    const newBranch: ConversationBranch = {
      id: branchId,
      name: branchName,
      parentBranchId: currentBranch?.id,
      messages: messagesToInclude,
      createdAt: new Date(),
      summary: messagesToInclude.length > 5 ? createContextSummary(messagesToInclude) : undefined,
      tokenCount: calculateMessageTokens(messagesToInclude)
    };

    setConversationBranches(prev => [...prev, newBranch]);
    setCurrentBranch(newBranch);
    
    // Create a compressed version of the conversation for the new branch
    if (messagesToInclude.length > 5) {
      const compressedMessages = [
        {
          id: `summary-${branchId}`,
          content: `📚 **Context Summary**: ${newBranch.summary}\n\nContinuing our exploration...`,
          role: 'assistant' as const,
          timestamp: new Date(),
          context: enhancedContext
        },
        ...messagesToInclude.slice(-3) // Keep last 3 messages for immediate context
      ];
      setMessages(compressedMessages);
    } else {
      setMessages(messagesToInclude);
    }

    // Save to localStorage
    localStorage.setItem(`branches-${contextKey}`, JSON.stringify([...conversationBranches, newBranch]));
  };

  // Switch to an existing branch
  const switchToBranch = (branchId: string) => {
    const branch = conversationBranches.find(b => b.id === branchId);
    if (branch) {
      setCurrentBranch(branch);
      setMessages(branch.messages);
    }
  };

  // Suggest branching when context gets large
  const shouldSuggestBranching = (): boolean => {
    return contextMetrics.currentTokens > contextMetrics.warningThreshold;
  };

  // Calculate optimal response length - keep it minimal
  const getOptimalResponseLength = (): number => {
    // Always use very short responses to prevent rate limiting
    return 50;
  };

  // Much more aggressive conversation compression
  const compressConversationHistory = (history: any[]): any[] => {
    // ALWAYS keep only the last 2 exchanges (4 messages) to minimize context
    const maxMessages = 4;
    const recentHistory = history.slice(-maxMessages);
    
    // If we had older messages, create a very brief summary
    if (history.length > maxMessages) {
      const userMessages = history.slice(0, -maxMessages).filter(h => h.role === 'user');
      const lastTopics = userMessages.slice(-2).map(h => 
        h.parts[0].text.split(/[.!?]/)[0].substring(0, 30)
      ).join(', ');
      
      const summary = `[Earlier: ${lastTopics}]`;
      return [
        { role: 'user', parts: [{ text: summary }] },
        ...recentHistory
      ];
    }
    
    return recentHistory;
  };

  // Request throttling to prevent rate limiting
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [requestQueue, setRequestQueue] = useState<string[]>([]);
  const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

  const throttleRequest = async (message: string): Promise<boolean> => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      setThrottleMessage(`⏳ Waiting ${Math.ceil(waitTime/1000)}s to prevent rate limiting...`);
      console.log(`🕐 Throttling request, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      setThrottleMessage('');
    }
    
    setLastRequestTime(Date.now());
    return true;
  };

  // Handle persona selection
  const handlePersonaSelection = (persona: SocratesPersonaOption) => {
    setSelectedPersona(persona);
    setShowPersonaSelection(false);
    
    // Update the stored discussion context with the selected persona
    const storedContext = localStorage.getItem('currentDiscussionContext');
    if (storedContext) {
      try {
        const discussionData = JSON.parse(storedContext);
        discussionData.selectedPersona = persona;
        localStorage.setItem('currentDiscussionContext', JSON.stringify(discussionData));
        
        // Add a persona introduction message
        const introMessage: Message = {
          id: (Date.now() + 1000).toString(),
          content: `Perfect! I'm now channeling ${persona.name}. ${persona.approach} Let's explore "${discussionData.title}" together. What aspects of this discussion would you like to dive deeper into?`,
          role: 'assistant',
          timestamp: new Date(),
          context: enhancedContext
        };
        setMessages(prev => [...prev, introMessage]);
      } catch (error) {
        console.error('Error updating discussion context with persona:', error);
      }
    }
  };

  // Load context information for better assistance
  useEffect(() => {
    if (enhancedContext.id && enhancedContext.type) {
      mockCanvasApi.getContextInfo(enhancedContext.type, enhancedContext.id).then(info => {
        setContextInfo(info);
        
        // Handle discussion context with persona selection
        if (enhancedContext.type === 'discussion') {
          const storedDiscussionContext = localStorage.getItem('currentDiscussionContext');
          if (storedDiscussionContext) {
            try {
              const discussionData = JSON.parse(storedDiscussionContext);
              const personas = generateDiscussionPersonas(discussionData, info);
              setDiscussionPersonas(personas);
              
              // Check if a persona was already selected
              if (discussionData.selectedPersona) {
                setSelectedPersona(discussionData.selectedPersona);
                setShowPersonaSelection(false);
              } else if (messages.length <= 1) {
                // Show persona selection for new discussions
                setShowPersonaSelection(true);
              }
            } catch (error) {
              console.error('Error parsing discussion context:', error);
            }
          }
        }
      }).catch(error => {
        console.error('Error loading context info:', error);
      });
    }
  }, [enhancedContext, messages.length]);

  // Update context metrics when messages change
  useEffect(() => {
    const currentTokens = calculateMessageTokens(messages);
    setContextMetrics(prev => ({
      ...prev,
      currentTokens
    }));

    // Update current branch if it exists
    if (currentBranch) {
      const updatedBranch = {
        ...currentBranch,
        messages,
        tokenCount: currentTokens
      };
      setCurrentBranch(updatedBranch);
      
      // Update in the branches array
      setConversationBranches(prev => 
        prev.map(branch => branch.id === currentBranch.id ? updatedBranch : branch)
      );
    }
  }, [messages, currentBranch?.id]);

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
        console.log('Chat: Getting welcome message for context:', enhancedContext);
        
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
          // Check for persona-specific context
          const storedDiscussionContext = localStorage.getItem('currentDiscussionContext');
          if (storedDiscussionContext) {
            try {
              const discussionData = JSON.parse(storedDiscussionContext);
              if (discussionData.selectedPersona) {
                const persona = discussionData.selectedPersona;
                return `Greetings! I'm channeling ${persona.name} today. ${persona.approach} Ready to explore "${discussionData.title}" together?`;
              }
            } catch (error) {
              console.error('Error parsing discussion context:', error);
            }
          }
          return `Hello there, I see you're working with this discussion. I can engage with you in different ways:

**Classic Socrates** - Traditional Socratic method questioning
**Discussion Moderator** - Synthesizes viewpoints and guides conversation  
**Subject Expert** - Course-specific academic insights
**Participant Simulator** - Continues as if I'm another student (for active discussions)
**Ethics Philosopher** - Explores moral reasoning and ethical implications
**Devil's Advocate** - Challenges ideas to strengthen arguments

Choose how you'd like me to approach our conversation using the options below!`;
        } else if (enhancedContext.type === 'calendar') {
          return `Hello again, how can I help you organize your studies?`;
        } else if (enhancedContext.type === 'dashboard') {
          return `Hello there, I can help you plan your academic priorities and manage your time effectively. What's on your mind?`;
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
      // Throttle requests to prevent rate limiting
      await throttleRequest(userMessage);
      
      // Check if user is authenticated
      if (!user) {
        console.log('❌ User not authenticated');
        return "Please log in to access the AI tutoring features.";
      }

      // Get essential context for calendar/dashboard without overloading API
      let courseData = { type: enhancedContext?.type || 'general' };
      
      // Load page-specific context
      if (enhancedContext?.type === 'calendar') {
        try {
          const calendarData = await mockCanvasApi.getCalendarEvents();
          courseData = { 
            type: 'calendar',
            calendarEvents: calendarData?.slice(0, 8) || [],
            currentDate: new Date().toLocaleDateString()
          } as any;
        } catch (error) {
          console.log('⚠️ Could not load calendar data:', error);
        }
      } else if (enhancedContext?.type === 'dashboard') {
        try {
          const dashboardData = await mockCanvasApi.getDashboardData();
          courseData = {
            type: 'dashboard',
            courses: dashboardData?.courses?.slice(0, 5) || [],
            upcomingAssignments: dashboardData?.upcomingAssignments?.slice(0, 6) || [],
            currentDate: new Date().toLocaleDateString()
          } as any;
        } catch (error) {
          console.log('⚠️ Could not load dashboard data:', error);
        }
      }
      
      console.log('📊 Page context loaded:', courseData.type, (courseData as any).calendarEvents?.length || (courseData as any).upcomingAssignments?.length || 0, 'items');
      
      // Check for API key
      console.log('🔑 API Key check:', apiKey ? 'Found' : 'Missing');
        
      if (!apiKey) {
        console.log('❌ No API key found');
        return "I need an API key to provide intelligent responses. Please set your Gemini API key in the settings.";
      }

      // Use Gemini 2.0 Flash for intelligent responses (same model as settings)
      console.log('🤖 Initializing Gemini...');
      const genAI = new GoogleGenerativeAI(apiKey);
      const optimalLength = getOptimalResponseLength();
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash", // Changed from gemini-2.0-flash-exp to match settings
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: optimalLength,
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
      
      // Compress conversation history if needed
      const compressedHistory = compressConversationHistory(conversationHistory);
      
      // Create the full conversation with system instruction
      const fullConversation = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...compressedHistory
      ];
      
      console.log(`📊 Context optimization: ${conversationHistory.length} → ${compressedHistory.length} messages`);
      console.log(`🎯 Using ${optimalLength} token limit`);

      // Exponential backoff for rate limiting
      let retryCount = 0;
      const maxRetries = 3;
      let result;

             while (retryCount <= maxRetries) {
         try {
           result = await model.generateContent({
             contents: fullConversation,
             generationConfig: {
               temperature: 0.7,
               maxOutputTokens: optimalLength,
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
           break; // Success, exit retry loop
         } catch (error: any) {
           if (error?.message?.includes('quota') || error?.message?.includes('rate')) {
             retryCount++;
             if (retryCount <= maxRetries) {
               const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
               console.log(`🔄 Rate limited, retrying in ${waitTime}ms (attempt ${retryCount}/${maxRetries})`);
               await new Promise(resolve => setTimeout(resolve, waitTime));
               continue;
             }
           }
           throw error; // Re-throw if not rate limit or max retries reached
         }
               }
        
        if (!result) {
          throw new Error('Failed to get response after all retries');
        }
        
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
    // Include branch context if available
    let branchContext = '';
    if (currentBranch && currentBranch.summary) {
      branchContext = `\n\nBRANCH CONTEXT:\nThis conversation is on branch "${currentBranch.name}". ${currentBranch.summary}\n`;
    }

    // Analyze conversation history for better context
    const conversationSummary = messages.length > 1 ? 
      `\n\nCONVERSATION CONTEXT:\nThis is a continuing conversation. Previous topics discussed: ${messages.slice(0, -1).map(msg => 
        msg.role === 'user' ? `Student asked: "${msg.content.substring(0, 100)}..."` : 
        `You responded about: "${msg.content.substring(0, 100)}..."`
      ).join('\n')}\n\nCurrent student question: "${userMessage}"\n` : 
      `\n\nSTUDENT'S CURRENT QUESTION: "${userMessage}"\n`;

    // Build context-specific information
    let contextInfo = '';
    
    if (context?.type === 'assignment' && courseData?.assignment) {
      const assignment = courseData.assignment;
      const course = courseData.course;
      
      contextInfo = `\n\nCURRENT ASSIGNMENT CONTEXT:
Assignment: "${assignment.name}"
Course: ${course ? course.name : 'Unknown Course'}
Due Date: ${assignment.due_at}
Points: ${assignment.points_possible}
Status: ${assignment.status}

ASSIGNMENT INSTRUCTIONS:
${assignment.description}

You can reference specific terms, concepts, and requirements from this assignment directly. When students ask about "confusing terms" or need help, refer to the actual content above.
`;
    } else if (context?.type === 'course' && courseData?.course) {
      const course = courseData.course;
      const upcomingAssignments = courseData.upcomingAssignments || [];
      
      contextInfo = `\n\nCURRENT COURSE CONTEXT:
Course: "${course.name}" (${course.course_code})
Instructor: ${course.instructor}
Description: ${course.description}

UPCOMING ASSIGNMENTS:
${upcomingAssignments.map((a: any) => `- ${a.name} (Due: ${a.due_at})`).join('\n')}
`;
    } else if (context?.type === 'discussion' && courseData?.discussion) {
      const discussion = courseData.discussion;
      const course = courseData.course;
      
      // Check for enhanced discussion context with persona
      const storedDiscussionContext = localStorage.getItem('currentDiscussionContext');
      let enhancedDiscussionInfo = '';
      let personaContext = '';
      
      if (storedDiscussionContext) {
        try {
          const discussionData = JSON.parse(storedDiscussionContext);
          if (discussionData.selectedPersona) {
            const persona = discussionData.selectedPersona;
            personaContext = `\n\nPERSONA GUIDANCE:
You are channeling the role of "${persona.name}": ${persona.description}
Approach: ${persona.approach}
Maintain this persona throughout the conversation while helping the student.
`;
          }
          
          if (discussionData.originalPost && discussionData.replies) {
            enhancedDiscussionInfo = `\n\nDISCUSSION PARTICIPANTS & CONTENT:
Original Post by ${discussionData.originalPost.author}:
"${discussionData.originalPost.message}"

Replies (${discussionData.replies.length}):
${discussionData.replies.map((reply: any, index: number) => 
  `${index + 1}. ${reply.author}: "${reply.message.substring(0, 200)}${reply.message.length > 200 ? '...' : ''}"`
).join('\n')}

Participants: ${discussionData.participants.join(', ')}
`;
          }
        } catch (error) {
          console.error('Error parsing stored discussion context:', error);
        }
      }
      
      contextInfo = `\n\nCURRENT DISCUSSION CONTEXT:
Discussion: "${discussion.title}"
Course: ${course ? course.name : 'Unknown Course'}
Topic: ${discussion.topic || 'General discussion'}

DISCUSSION PROMPT:
${discussion.description || 'No description available'}
${enhancedDiscussionInfo}${personaContext}
`;
    } else if (context?.type === 'dashboard' && courseData?.dashboard) {
      const dashboard = courseData.dashboard;
      const currentDate = new Date().toLocaleDateString();
      
      // Calculate workload metrics
      const totalUpcoming = dashboard.upcomingAssignments?.length || 0;
      const thisWeek = dashboard.upcomingAssignments?.filter((a: any) => {
        const dueDate = new Date(a.due_at);
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate >= today && dueDate <= weekFromNow;
      }).length || 0;
      
      contextInfo = `\n\nSTUDENT'S CURRENT ACADEMIC DASHBOARD:
Date: ${currentDate}
Enrolled Courses: ${dashboard.courses?.length || 0}
Total Upcoming Assignments: ${totalUpcoming}
Due This Week: ${thisWeek}

COURSES & WORKLOAD:
${dashboard.courses?.map((c: any) => `- ${c.name} (${c.course_code}) - Progress: ${c.progress || 0}%`).join('\n') || 'No courses enrolled'}

UPCOMING DEADLINES (Next 2 weeks):
${dashboard.upcomingAssignments?.slice(0, 6).map((a: any) => 
  `- ${a.name} (Due: ${new Date(a.due_at).toLocaleDateString()}) - ${a.points_possible} pts`
).join('\n') || 'No upcoming assignments'}

RECENT CALENDAR EVENTS:
${dashboard.recentEvents?.slice(0, 4).map((e: any) => 
  `- ${e.title} (${new Date(e.start_date).toLocaleDateString()}) - ${e.course_name}`
).join('\n') || 'No recent events'}

Your role is to help this student plan their academic priorities, manage time effectively, and create realistic study schedules based on their actual workload.
`;
    } else {
      // For general context, get user's enrolled courses
      const userData = getUserData();
      const userEnrollments = userData?.courseProgress ? Object.keys(userData.courseProgress) : [];
      contextInfo = `\n\nGENERAL COURSE CONTEXT:
User: ${user?.name || 'Unknown User'}
Enrolled Courses: ${userEnrollments.length > 0 ? userEnrollments.join(', ') : 'No courses enrolled'}
`;
    }

    // Extract key context efficiently
    const keyInfo = extractKeyInformation(messages);
    const contextType = context?.type || 'general';
    
         // Build page-aware context sections
     let roleContext = '';
     let pageInfo = '';
     
     switch (contextType) {
       case 'calendar':
         roleContext = 'FOCUS: Help prioritize upcoming deadlines and plan study time.';
         if (courseData.calendarEvents?.length > 0) {
           const urgentItems = courseData.calendarEvents
             .filter((event: any) => new Date(event.start_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
             .slice(0, 3);
           pageInfo = urgentItems.length > 0 
             ? `CALENDAR: ${urgentItems.map((e: any) => `${e.title} (${e.type}) - ${new Date(e.start_date).toLocaleDateString()}`).join(', ')}`
             : '';
         }
         break;
       case 'dashboard':
         roleContext = 'FOCUS: Help with course overview and task prioritization.';
         if (courseData.upcomingAssignments?.length > 0) {
           const nextAssignments = courseData.upcomingAssignments.slice(0, 3);
           pageInfo = `DASHBOARD: Next up - ${nextAssignments.map((a: any) => `${a.name} (due ${new Date(a.due_date).toLocaleDateString()})`).join(', ')}`;
         }
         break;
       case 'assignment':
         roleContext = 'FOCUS: Ask specific questions about assignment approach.';
         break;
       case 'discussion':
         const storedContext = localStorage.getItem('currentDiscussionContext');
         let personaInfo = '';
         if (storedContext) {
           try {
             const data = JSON.parse(storedContext);
             if (data.selectedPersona) {
               personaInfo = ` As ${data.selectedPersona.name}, `;
             }
           } catch (e) {}
         }
         roleContext = `FOCUS:${personaInfo} Ask questions that encourage different perspectives.`;
         break;
       case 'quiz':
         roleContext = context?.state === 'completed' 
           ? 'FOCUS: Ask what they learned from the experience.' 
           : 'FOCUS: Ask questions to clarify concepts without giving answers.';
         break;
       default:
         roleContext = 'FOCUS: Listen and ask focused questions to guide learning.';
     }

         // MINIMAL prompt with page context
     const minimalPrompt = `Socrates tutor. ${roleContext}
${pageInfo ? `PAGE CONTEXT: ${pageInfo}` : ''}
Student: "${userMessage.substring(0, 100)}"
Response: 1-2 sentences + question.`;

     return optimizeForTokenEfficiency(minimalPrompt);
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
      // Check if we need to auto-branch due to context size
      if (contextMetrics.currentTokens > contextMetrics.criticalThreshold && !currentBranch) {
        const autoBranchName = `Auto-Branch ${conversationBranches.length + 1}`;
        createNewBranch(autoBranchName);
      }

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

        {/* Context Window Indicator */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Info className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600">
                  Context: {Math.round((contextMetrics.currentTokens / contextMetrics.maxTokens) * 100)}%
                </span>
              </div>
              <div 
                className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"
                title={`${contextMetrics.currentTokens.toLocaleString()} / ${contextMetrics.maxTokens.toLocaleString()} tokens`}
              >
                <div 
                  className={`h-full transition-all duration-300 ${
                    contextMetrics.currentTokens > contextMetrics.criticalThreshold 
                      ? 'bg-red-500' 
                      : contextMetrics.currentTokens > contextMetrics.warningThreshold 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((contextMetrics.currentTokens / contextMetrics.maxTokens) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            {(conversationBranches.length > 0 || shouldSuggestBranching()) && (
              <button
                onClick={() => setShowBranchManager(!showBranchManager)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                  shouldSuggestBranching() 
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <GitBranch className="w-3 h-3" />
                <span>{shouldSuggestBranching() ? 'Branch Suggested' : 'Manage Branches'}</span>
                {shouldSuggestBranching() && <AlertTriangle className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Branch Management Panel */}
        {showBranchManager && (
          <div className="border-t border-gray-200 bg-blue-50 p-3">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
                <GitBranch className="w-4 h-4 mr-1 text-blue-600" />
                Conversation Branches
              </h3>
              {shouldSuggestBranching() && (
                <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-2">
                  <p className="text-xs text-yellow-800 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Context window getting large. Consider branching to explore new topics while preserving this conversation.
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-600">
                Create branches to explore different topics without losing your conversation history.
              </p>
            </div>
            
            <div className="space-y-2 mb-3 max-h-24 overflow-y-auto">
              {conversationBranches.map((branch) => (
                <div 
                  key={branch.id} 
                  className={`flex items-center justify-between p-2 rounded text-xs ${
                    currentBranch?.id === branch.id 
                      ? 'bg-blue-200 border border-blue-300' 
                      : 'bg-white border border-gray-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{branch.name}</div>
                    <div className="text-gray-500">
                      {branch.messages.length} messages • {Math.round((branch.tokenCount / contextMetrics.maxTokens) * 100)}% context
                    </div>
                  </div>
                  {currentBranch?.id !== branch.id && (
                    <button
                      onClick={() => switchToBranch(branch.id)}
                      className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Switch
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="New branch name..."
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      createNewBranch(target.value.trim());
                      target.value = '';
                      setShowBranchManager(false);
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const branchName = `Side Quest ${conversationBranches.length + 1}`;
                  createNewBranch(branchName);
                  setShowBranchManager(false);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Quick Branch
              </button>
            </div>
          </div>
        )}

        {/* Persona Selection for Discussion Contexts */}
        {showPersonaSelection && enhancedContext?.type === 'discussion' && (
          <div className="border-t border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-3">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
                <Bot className="w-4 h-4 mr-1 text-purple-600" />
                Choose Your Socratic Guide
              </h3>
              <p className="text-xs text-gray-600">
                Select your preferred approach:
              </p>
            </div>
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {discussionPersonas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaSelection(persona)}
                  className="text-left bg-white rounded-lg p-2 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-xs mb-1">{persona.name}</div>
                  <div className="text-xs text-gray-600 mb-1">{persona.description}</div>
                  <div className="text-xs text-purple-600 italic">{persona.approach}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
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
        {(isLoading || throttleMessage) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-6 py-4">
              {throttleMessage ? (
                <p className="text-xs text-gray-600">{throttleMessage}</p>
              ) : (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
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