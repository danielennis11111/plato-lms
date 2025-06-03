'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Load chat history from localStorage on mount
  useEffect(() => {
    const loadChatHistory = () => {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Filter messages by current context if provided
        const contextMessages = context 
          ? parsedMessages.filter((msg: Message) => {
              if (!msg.context || !context) return false;
              if (context.type === 'dashboard') {
                return msg.context.type === 'dashboard';
              }
              return msg.context.type === context.type && 
                     msg.context.id === context.id;
            })
          : parsedMessages;
        
        // Sort messages by timestamp
        contextMessages.sort((a: Message, b: Message) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setMessages(contextMessages);
      }
      setIsInitialized(true);
    };

    loadChatHistory();
  }, [context]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && isInitialized) {
      const savedMessages = localStorage.getItem('chatHistory');
      const existingMessages = savedMessages ? JSON.parse(savedMessages) : [];
      
      // Remove old messages for this context
      const filteredMessages = existingMessages.filter((msg: Message) => {
        if (!msg.context || !context) return true;
        if (context.type === 'dashboard') {
          return msg.context.type !== 'dashboard';
        }
        return msg.context.type !== context.type || msg.context.id !== context.id;
      });

      // Convert timestamps to ISO strings for storage
      const messagesToSave = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));

      // Add new messages
      const updatedMessages = [...filteredMessages, ...messagesToSave];
      localStorage.setItem('chatHistory', JSON.stringify(updatedMessages));
    }
  }, [messages, context, isInitialized]);

  // Initialize chat with context
  useEffect(() => {
    if (context && !isInitialized && messages.length === 0) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        content: `Starting a new chat about ${context.title || context.type}. How can I help you today?`,
        role: 'assistant',
        timestamp: new Date(),
        context
      };
      setMessages([initialMessage]);
    }
  }, [context, isInitialized, messages.length]);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const generateResponse = async (userInput: string, context: ChatProps['context']) => {
    if (!context) return "I'm here to help! What would you like to know?";

    const maxRetries = 3;
    let retryCount = 0;
    // Clear previous debug info
    setDebugInfo(null);

    while (retryCount < maxRetries) {
      try {
        // Get relevant context data
        let contextData = '';
        
        switch (context.type) {
          case 'course': {
            const course = await mockCanvasApi.getCourse(context.id!);
            if (course) {
              contextData = `Course: ${course.name}\nDescription: ${course.syllabus}\nInstructor: ${course.instructor}\nCurrent Grade: ${course.current_grade}%\nModules: ${course.modules.length}`;
            }
            break;
          }
          case 'assignment': {
            const assignment = await mockCanvasApi.getAssignments().then(assignments => 
              assignments.find(a => a.id === context.id)
            );
            if (assignment) {
              contextData = `Assignment: ${assignment.name}\nDescription: ${assignment.description}\nPoints: ${assignment.points_possible}\nStatus: ${assignment.status}\nDue: ${new Date(assignment.due_at).toLocaleDateString()}`;
            }
            break;
          }
          case 'module': {
            const course = await mockCanvasApi.getCourse(context.courseId!);
            const module = course?.modules.find(m => m.id === context.id);
            if (module) {
              contextData = `Module: ${module.name}\nDescription: ${module.description}\nItems: ${module.items.length}\nStatus: ${module.is_completed ? 'Completed' : 'In Progress'}`;
            }
            break;
          }
        }

        // Get learning objectives based on context
        const learningObjectives = getLearningObjectives(context);

        // Get the user's Gemini API key
        const apiKey = localStorage.getItem('geminiApiKey');
        
        if (!apiKey) {
          console.error('No API key found in localStorage');
          setDebugInfo('Error: No API key found in localStorage');
          return "Please set up your Gemini API key in the settings page to use the AI assistant. You can go to the Settings page from the sidebar.";
        }

        console.log('Using API key:', apiKey.substring(0, 5) + '...'); // Log first 5 chars for debugging
        setDebugInfo(`API Key: ${apiKey.substring(0, 5)}..., Context: ${context.type}, Model: gemini-2.0-flash`);

        // Initialize the Gemini API client
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Get the model
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash"
        });

        // Create system prompt with strong ethical guidelines
        const systemPrompt = `You are Plato, an AI learning assistant that helps students with their courses, assignments, and learning needs.
        
        Current context information:
        ${contextData}
        
        ${learningObjectives}
        
        IMPORTANT ETHICAL GUIDELINES:
        1. Never provide direct answers to assignment questions or homework problems
        2. Instead of solving problems, guide students through the thought process
        3. Ask probing questions that lead students to discover answers themselves
        4. Focus on explaining concepts, not providing solutions
        5. If a student is clearly asking for direct answers to an assignment, politely redirect them to learning the underlying concepts
        6. Use the Socratic method to promote critical thinking
        7. Provide examples that are different from assignment questions to illustrate concepts
        8. Encourage students to consult course materials and resources
        
        Your role is to:
        - Help students understand concepts and build skills
        - Guide critical thinking through thoughtful questions
        - Encourage independent problem-solving
        - Support learning without doing the work for students
        - Adapt your assistance based on the specific learning context
        
        Keep your responses helpful, clear, and focused on supporting the student's learning journey while encouraging critical thinking and academic integrity.`;

        console.log('Starting chat with context:', context.type);

        // Properly format past messages for the chat history
        const previousMessages = messages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          }))
          .slice(-10);
        
        // Create the full chat history with system prompt
        const chatHistory = [
          // Add system prompt as first message (as assistant)
          {
            role: 'assistant' as const,
            parts: [{ text: systemPrompt }]
          },
          // Add previous messages
          ...previousMessages
        ];

        // Directly send the message without creating a chat session first
        console.log('Sending message to Gemini API');
        setDebugInfo(prev => `${prev}\nSending message to Gemini API with ${chatHistory.length} previous messages`);
        
        const result = await model.generateContent({
          contents: [
            ...chatHistory,
            {
              role: 'user' as const,
              parts: [{ text: userInput }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            }
          ]
        });

        // Extract the response text
        const response = result.response;
        const text = response.text();

        if (!text) {
          console.error('Empty response from Gemini API');
          setDebugInfo(prev => `${prev}\nError: Empty response from Gemini API`);
          throw new Error('No response text received from Gemini API');
        }

        console.log('Received response from Gemini API');
        setDebugInfo(prev => `${prev}\nReceived response from Gemini API (${text.length} chars)`);
        return text;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        setDebugInfo(prev => `${prev}\nAttempt ${retryCount + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            console.error('API key error:', error.message);
            setDebugInfo(prev => `${prev}\nAPI key error: ${error.message}`);
            return "There seems to be an issue with your API key. Please check your settings and try again.";
          }
          if (error.message.includes('quota')) {
            console.error('Quota error:', error.message);
            setDebugInfo(prev => `${prev}\nQuota error: ${error.message}`);
            return "You've reached your API quota limit. Please try again later or upgrade your plan.";
          }
          if (error.message.includes('model')) {
            console.error('Model error:', error.message);
            setDebugInfo(prev => `${prev}\nModel error: ${error.message}`);
            return "There was an issue with the AI model. Please try again later.";
          }
          if (error.message.includes('permission')) {
            console.error('Permission error:', error.message);
            setDebugInfo(prev => `${prev}\nPermission error: ${error.message}`);
            return "You don't have permission to use this API. Please check your API key and try again.";
          }
          if (error.message.includes('network')) {
            console.error('Network error:', error.message);
            setDebugInfo(prev => `${prev}\nNetwork error: ${error.message}`);
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`Retrying in ${retryCount * 1000}ms...`);
              setDebugInfo(prev => `${prev}\nRetrying in ${retryCount * 1000}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
              continue;
            }
            setDebugInfo(prev => `${prev}\nNetwork error. Please check your internet connection and try again.`);
            return "Network error. Please check your internet connection and try again.";
          }
          if (error.message.includes('RECITATION')) {
            console.error('Recitation error:', error.message);
            setDebugInfo(prev => `${prev}\nRecitation error: ${error.message}`);
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`Retrying in ${retryCount * 1000}ms...`);
              setDebugInfo(prev => `${prev}\nRetrying in ${retryCount * 1000}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
              continue;
            }
            setDebugInfo(prev => `${prev}\nI apologize, but I'm having trouble generating a response. Please try rephrasing your question.`);
            return "I apologize, but I'm having trouble generating a response. Please try rephrasing your question.";
          }
          // Handle blocked by safety settings
          if (error.message.includes('safety')) {
            console.error('Safety error:', error.message);
            setDebugInfo(prev => `${prev}\nSafety error: ${error.message}`);
            return "I'm unable to provide a response as the content may violate safety guidelines. Please rephrase your question.";
          }
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying in ${retryCount * 1000}ms...`);
          setDebugInfo(prev => `${prev}\nRetrying in ${retryCount * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
          continue;
        }
        
        console.error('Unexpected error:', error);
        setDebugInfo(prev => `${prev}\nUnexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return "I'm sorry, there was an error generating a response. Please try again later.";
      }
    }
    
    return "I'm sorry, I wasn't able to generate a response after multiple attempts. Please try again later.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
      context
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSimilarChats(false);
    
    try {
      // Check if user is asking for direct answers in assignment context
      if (context?.type === 'assignment' && isAskingForDirectAnswer(input)) {
        const guidanceMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 
            "I notice you might be asking for a direct answer to your assignment. As your learning assistant, I'm here to help you understand concepts and develop problem-solving skills, not to complete assignments for you. \n\n" +
            "Instead, I can help by:\n" +
            "- Breaking down the problem into smaller steps\n" +
            "- Explaining relevant concepts\n" +
            "- Providing similar examples\n" +
            "- Guiding you through the reasoning process\n\n" +
            "Could you tell me which part of the assignment you're struggling with, or what concept you'd like me to explain?",
          role: 'assistant',
          timestamp: new Date(),
          context
        };
        
        setMessages(prev => [...prev, guidanceMessage]);
        setIsLoading(false);
        return;
      }
      
      const aiResponse = await generateResponse(input, context);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {filteredMessages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-50 text-gray-900'
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown components={components}>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-xl px-4 py-2 shadow flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        {!hasApiKey && (
          <div className="flex justify-center my-4">
            <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg max-w-md">
              <p className="text-sm">
                AI assistant requires a Gemini API key. 
                <Link href="/settings" className="ml-1 font-medium text-blue-600 hover:text-blue-800">
                  Set up in Settings
                </Link>
              </p>
            </div>
          </div>
        )}
        {debugInfo && (
          <div className="flex justify-center my-4">
            <div className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg max-w-md w-full font-mono text-xs">
              <details>
                <summary className="cursor-pointer">Debug Info</summary>
                <pre className="whitespace-pre-wrap mt-2">{debugInfo}</pre>
              </details>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
} 