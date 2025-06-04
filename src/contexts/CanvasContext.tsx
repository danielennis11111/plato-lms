'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  CanvasAPIService, 
  createCanvasAPI, 
  CanvasUser, 
  CanvasCourse,
  GeminiKeyService,
  CanvasConfig 
} from '@/lib/canvasApiService';

interface CanvasContextType {
  // Canvas Data
  user: CanvasUser | null;
  courses: CanvasCourse[];
  isLoading: boolean;
  isConnected: boolean;
  
  // Canvas API
  canvasAPI: CanvasAPIService | null;
  connectToCanvas: (config: CanvasConfig) => Promise<void>;
  disconnect: () => void;
  
  // Gemini API Key Management
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string, name?: string) => void;
  hasGeminiKey: boolean;
  
  // Demo Mode
  isDemoMode: boolean;
  enableDemoMode: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

interface CanvasProviderProps {
  children: ReactNode;
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const [user, setUser] = useState<CanvasUser | null>(null);
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [canvasAPI, setCanvasAPI] = useState<CanvasAPIService | null>(null);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true); // Start in demo mode

  // Initialize on mount
  useEffect(() => {
    initializeCanvas();
  }, []);

  const initializeCanvas = async () => {
    try {
      setIsLoading(true);
      
      // Check for stored Canvas configuration
      const storedConfig = localStorage.getItem('canvas_config');
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        await connectToCanvas(config);
      } else {
        // Enable demo mode by default
        enableDemoMode();
      }
    } catch (error) {
      console.error('Canvas initialization error:', error);
      enableDemoMode();
    } finally {
      setIsLoading(false);
    }
  };

  const connectToCanvas = async (config: CanvasConfig): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Create Canvas API service
      const api = createCanvasAPI(config);
      setCanvasAPI(api);
      
      // Fetch user data
      const userData = await api.getCurrentUser();
      setUser(userData);
      
      // Fetch courses
      const coursesData = await api.getCourses('active');
      setCourses(coursesData);
      
      // Load user's Gemini API key
      const userGeminiKey = GeminiKeyService.getUserKey(userData.id);
      setGeminiApiKeyState(userGeminiKey);
      
      setIsConnected(true);
      setIsDemoMode(false);
      
      // Store configuration for future sessions
      localStorage.setItem('canvas_config', JSON.stringify(config));
      
    } catch (error) {
      console.error('Canvas connection error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setUser(null);
    setCourses([]);
    setCanvasAPI(null);
    setIsConnected(false);
    setGeminiApiKeyState(null);
    localStorage.removeItem('canvas_config');
    enableDemoMode();
  };

  const setGeminiApiKey = (key: string, name: string = 'Default') => {
    if (user && isConnected) {
      // Save to user-specific storage
      GeminiKeyService.saveUserKey(user.id, key, name);
      setGeminiApiKeyState(key);
    } else {
      // Demo mode - use global storage for backward compatibility
      localStorage.setItem('geminiApiKey', key);
      setGeminiApiKeyState(key);
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setIsConnected(false);
    
    // In demo mode, check for global Gemini API key
    const globalKey = localStorage.getItem('geminiApiKey');
    setGeminiApiKeyState(globalKey);
    
    // Create demo user
    const demoUser: CanvasUser = {
      id: 0,
      name: 'Demo User',
      email: 'demo@example.com',
      short_name: 'Demo',
      sortable_name: 'User, Demo',
    };
    setUser(demoUser);
    
    // Demo courses will be provided by existing mock API
    setCourses([]);
  };

  const hasGeminiKey = Boolean(geminiApiKey);

  const value: CanvasContextType = {
    user,
    courses,
    isLoading,
    isConnected,
    canvasAPI,
    connectToCanvas,
    disconnect,
    geminiApiKey,
    setGeminiApiKey,
    hasGeminiKey,
    isDemoMode,
    enableDemoMode,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas(): CanvasContextType {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}

// Convenience hook for getting Gemini API key
export function useGeminiKey(): string | null {
  const { geminiApiKey } = useCanvas();
  return geminiApiKey;
} 