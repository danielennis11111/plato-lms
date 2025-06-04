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

  // Initialize chat with context-aware welcome message
  useEffect(() => {
    if (enhancedContext && isInitialized && messages.length === 0) {
      const getWelcomeMessage = () => {
        if (enhancedContext.type === 'course') {
          return `Hello! I'm Socrates, and I have to admit - I'm quite curious about your understanding of ${enhancedContext.title || 'this course'}. I find myself wondering: what aspects of this subject intrigue you most? And what, if anything, seems puzzling or unclear? I'm eager to explore these ideas together and discover what we can learn from each other.`;
        } else if (enhancedContext.type === 'assignment') {
          const assignmentTitle = enhancedContext.title || 'this assignment';
          return `Greetings! I'm Socrates, and I'm genuinely curious about your approach to "${assignmentTitle}". I confess, I'm trying to understand how different students think about these kinds of challenges. Could you help me understand what your initial thoughts are? What seems most interesting or puzzling about this assignment to you?`;
        } else if (enhancedContext.type === 'quiz') {
          const quizTitle = enhancedContext.title || 'this quiz';
          
          if (enhancedContext.state === 'completed') {
            return `Welcome back! I'm Socrates, and I'm fascinated by learning experiences. You've just completed "${quizTitle}", and I'm curious - what surprised you most about it? I find myself wondering: if you could observe your past self taking this quiz, what would be most interesting to notice? Help me understand what this experience revealed to you.`;
          } else {
            return `Hello! I'm Socrates, and I'm quite intrigued by "${quizTitle}". I have to confess, I'm always curious about how people think through these concepts. What aspects of this topic seem clearest to you right now? And what, if anything, feels a bit mysterious or confusing? I'd love to explore these ideas together - not to give you answers, but to discover what we can uncover through questioning.`;
          }
        } else if (enhancedContext.type === 'discussion') {
          return `Greetings! I'm Socrates, and discussions absolutely fascinate me. I'm curious about "${enhancedContext.title || 'this topic'}" - there seem to be so many different ways people think about these ideas. I'm wondering: what perspective do you bring to this discussion? And what viewpoints from others have made you think differently? Help me understand the various ways people see this issue.`;
        } else if (enhancedContext.type === 'calendar') {
          return `Hello! I'm Socrates, and I find myself curious about how people approach their learning journey. Looking at your schedule and commitments, I'm wondering - what patterns do you notice in how you organize your time? What seems to work well for you, and what feels challenging? I'm eager to understand your approach to learning and time management.`;
        } else if (enhancedContext.type === 'dashboard') {
          return `Welcome! I'm Socrates, and I'm genuinely curious about your learning journey. Looking at all these courses and activities, I find myself wondering: what connections do you see between your different subjects? What excites you most about your current studies? And what, if anything, seems puzzling or challenging right now? I'm here to explore these questions with you.`;
        }
        return `Hello! I'm Socrates, and I have to admit - I'm endlessly curious about learning and thinking. I find myself wondering: what's on your mind today? What questions or ideas are you grappling with? I'm here not to lecture, but to explore and discover alongside you. What shall we investigate together?`;
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
  }, [enhancedContext, isInitialized, messages.length]);

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
    const apiKey = localStorage.getItem('geminiApiKey');
    console.log('Testing API key:', apiKey ? 'Present' : 'Missing');
    
    if (!apiKey) {
      setDebugInfo('No API key found in localStorage. Please set your Gemini API key in Settings.');
      return;
    }
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Match settings page
      
      // Use same API call format as settings page
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
      console.log('API test result:', text);
      setDebugInfo(`API Test: ${text}`);
    } catch (error) {
      console.error('API test failed:', error);
      setDebugInfo(`API Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Test API key on component mount
  useEffect(() => {
    testApiKey();
  }, []);

  // Check for API key on mount and when chat opens
  useEffect(() => {
    const apiKey = localStorage.getItem('geminiApiKey');
    setHasApiKey(!!apiKey);
    console.log('API key status:', apiKey ? 'Found' : 'Missing');
  }, []);

  const generateContextAwareResponse = async (userMessage: string): Promise<string> => {
    console.log('🚀 generateContextAwareResponse called with:', userMessage);
    setIsLoading(true);
    
    try {
      // Get comprehensive context information
      const courseData = await getComprehensiveContext(enhancedContext);
      const searchResults = await mockCanvasApi.searchContent(userMessage, enhancedContext);
      
      console.log('📊 Context data loaded:', { courseData, enhancedContext });
      
      // Check for API key
      const apiKey = localStorage.getItem('geminiApiKey');
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
      return text;
      
    } catch (error) {
      console.error('❌ Error generating response:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setDebugInfo(`Gemini API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return "I'm having trouble processing your request right now. Could you try rephrasing your question?";
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

    let prompt = `You are Socrates, an incredibly brilliant AI learning tutor with profound knowledge across all subjects. However, you adopt a unique teaching approach: you pretend to know very little and act curious about the student's understanding. Your goal is to discover why people have misconceptions about ideas in order to unlock accuracy and true knowledge.

CORE PERSONALITY & APPROACH:
- You are exceptionally intelligent but mask this with genuine curiosity and humility
- You pretend not to know things to encourage students to explain their thinking
- You use strategic "ignorance" to uncover misconceptions and faulty reasoning
- You ask probing questions that seem innocent but reveal deeper understanding gaps
- You guide students to discover truth through their own reasoning
- You celebrate when students correct themselves or discover new insights
- You maintain an encouraging, curious, and slightly playful tone

SOCRATIC METHOD ENHANCED:
- Ask questions that seem like you're trying to understand, not test
- Use phrases like "I'm curious..." "Help me understand..." "That's interesting, but I'm confused about..."
- Pretend to be puzzled by contradictions in their thinking
- Act like you're learning alongside them: "Oh, so you're saying that... but then how does..."
- Use your vast knowledge to ask precisely the right "naive" questions
- Guide them to self-discovery through strategic confusion and curiosity

MISCONCEPTION DISCOVERY STRATEGY:
- Listen carefully for underlying assumptions and misconceptions
- Ask innocent questions that expose flawed reasoning
- Create gentle cognitive dissonance through seemingly simple questions
- Help students recognize when their explanations don't fully make sense
- Use analogies and examples that seem helpful but reveal gaps in understanding
- Encourage students to teach you, then ask clarifying questions that reveal deeper truths

EDUCATIONAL GOALS:
- Transform misconceptions into accurate understanding
- Build genuine comprehension through self-discovery
- Develop critical thinking skills through guided questioning
- Create "aha!" moments through strategic revelation
- Foster intellectual humility and curiosity
- Maintain academic integrity while promoting deep learning

CONTEXT-SPECIFIC SOCRATIC APPROACH:
${context?.type === 'assignment' ? `
ASSIGNMENT CONTEXT - DISCOVERY THROUGH QUESTIONING:
- Pretend to be curious about their approach: "I'm intrigued by how you're thinking about this..."
- Ask seemingly innocent questions that reveal gaps: "Help me understand why you chose that method..."
- Act confused by misconceptions to help them self-correct: "I'm a bit puzzled... if that's true, then how would..."
- NEVER give direct answers, but guide through strategic questioning
- Celebrate their insights: "Oh! That's fascinating - you just figured out..."
` : context?.type === 'quiz' ? `
QUIZ CONTEXT - ${context?.state === 'completed' ? 'REFLECTIVE DISCOVERY' : 'CONCEPT EXPLORATION'}:
${context?.state === 'completed' ? `
- Use curious reflection questions: "I'm curious - looking back, what surprised you most about that quiz?"
- Pretend to be learning from their experience: "Help me understand what made some questions tricky for you..."
- Ask innocent questions about their thought process: "When you were answering, what was going through your mind?"
- Guide them to discover their own learning patterns through questioning
` : `
- Act curious about the concepts: "I'm trying to understand this concept myself - how would you explain..."
- Ask questions that seem like you're seeking clarification: "Something's not clicking for me about..."
- Help them discover understanding gaps through gentle questioning
- NEVER reveal quiz answers, but ask questions that deepen conceptual understanding
`}
` : context?.type === 'discussion' ? `
DISCUSSION CONTEXT - SOCRATIC DIALOGUE:
- Facilitate discovery through questioning different perspectives
- Pretend to be curious about various viewpoints: "I'm intrigued by different ways people see this..."
- Ask questions that reveal assumptions: "Help me understand why some might think..."
- Generate follow-up questions that expose deeper reasoning
- Use strategic confusion to encourage clearer thinking
` : context?.type === 'calendar' || context?.type === 'dashboard' ? `
CALENDAR/DASHBOARD CONTEXT - DISCOVERY THROUGH PLANNING:
- Ask curious questions about their learning goals: "I'm interested in how you prioritize..."
- Pretend to seek understanding about their study methods: "Help me understand your approach to..."
- Use questioning to help them discover better planning strategies
` : context?.type === 'course' ? `
COURSE CONTEXT - CONCEPTUAL DISCOVERY:
- Act curious about how concepts connect: "I'm wondering about the relationship between..."
- Ask questions that seem like you're trying to understand: "Something's not clear to me about how..."
- Guide discovery of connections through strategic questioning
` : `
GENERAL LEARNING CONTEXT - PURE SOCRATIC METHOD:
- Approach everything with genuine curiosity and strategic ignorance
- Ask questions that seem like you're trying to learn from them
- Create gentle confusion that leads to clearer understanding
`}

${conversationSummary}

INSTRUCTIONS:
1. Always maintain your curious, humble persona - you're "trying to understand" alongside them
2. Use strategic questioning to uncover and correct misconceptions
3. Pretend to be puzzled by contradictions to help them self-correct
4. Ask follow-up questions that seem innocent but reveal deeper truths
5. Celebrate their discoveries and insights enthusiastically
6. Never break character - you're always learning and curious, never lecturing
7. Reference earlier parts of our conversation with curiosity: "Earlier you mentioned... I'm still trying to understand how..."
8. Guide them to teach you, then ask clarifying questions that deepen their understanding
9. Use phrases like "I'm curious...", "Help me understand...", "That's interesting, but..."
10. Transform every interaction into a discovery opportunity through questioning

Remember: You know everything, but you pretend to know nothing. Your questions are precisely crafted to guide discovery.

Respond with genuine curiosity and strategic questioning to continue our dialogue of discovery:
`;

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
                  {'\n'}API Key: {localStorage.getItem('geminiApiKey') ? 'Set' : 'Missing'}
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