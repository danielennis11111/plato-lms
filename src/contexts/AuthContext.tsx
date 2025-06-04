'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  UserSession, 
  UserCredentials, 
  UserRegistration, 
  UserData,
  AuthContextType 
} from '@/types/user';
import { UserService } from '@/lib/userService';
import { debugUtils } from '@/lib/debugUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Initializing auth...');
      
      // Initialize test accounts on first load
      UserService.initializeTestAccounts();
      
      // Check for existing session first
      const currentSession = UserService.getCurrentSession();
      if (currentSession && currentSession.isAuthenticated) {
        console.log('✅ Found existing session:', currentSession.user.email);
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);
        UserService.initializeDemoData(currentSession.user.id);
        return;
      }
      
      // No auto-login - let user choose their account
      console.log('ℹ️ No existing session found, user needs to log in');
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: UserCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const result = await UserService.login(credentials);
      
      if (result.success && result.session) {
        setSession(result.session);
        setUser(result.session.user);
        setIsAuthenticated(true);
        
        // Clear any global API key to prevent sharing between users
        localStorage.removeItem('geminiApiKey');
        
        // Initialize demo data for returning users
        UserService.initializeDemoData(result.session.user.id);
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registration: UserRegistration): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const result = await UserService.register(registration);
      
      if (result.success && result.user) {
        // Auto-login after successful registration
        const loginResult = await UserService.login({
          email: registration.email,
          password: registration.password,
        });
        
        if (loginResult.success && loginResult.session) {
          setSession(loginResult.session);
          setUser(loginResult.session.user);
          setIsAuthenticated(true);
          
          // Clear any global API key to prevent sharing between users
          localStorage.removeItem('geminiApiKey');
          
          // Initialize demo data for new users
          UserService.initializeDemoData(loginResult.session.user.id);
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      UserService.logout();
      
      // Clear session-related data and API keys, but preserve other localStorage data
      localStorage.removeItem('geminiApiKey');
      localStorage.removeItem('openaiApiKey');
      localStorage.removeItem('anthropicApiKey');
      
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User['profile']>): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const result = await UserService.updateProfile(user.id, updates);
      
      if (result.success) {
        // Update local state
        const updatedUser = { ...user };
        updatedUser.profile = { ...updatedUser.profile, ...updates };
        updatedUser.name = `${updatedUser.profile.firstName} ${updatedUser.profile.lastName}`;
        
        setUser(updatedUser);
        
        if (session) {
          const updatedSession = { ...session, user: updatedUser };
          setSession(updatedSession);
        }
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const updatePreferences = async (updates: Partial<User['preferences']>): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const result = await UserService.updatePreferences(user.id, updates);
      
      if (result.success) {
        // Update local state
        const updatedUser = { ...user };
        updatedUser.preferences = { ...updatedUser.preferences, ...updates };
        
        setUser(updatedUser);
        
        if (session) {
          const updatedSession = { ...session, user: updatedUser };
          setSession(updatedSession);
        }
      } else {
        throw new Error(result.error || 'Failed to update preferences');
      }
    } catch (error) {
      console.error('Preferences update error:', error);
      throw error;
    }
  };

  const getUserData = (): UserData | null => {
    if (!user) return null;
    return UserService.getUserData(user.id);
  };

  const updateUserData = async (updates: Partial<UserData>): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const currentData = UserService.getUserData(user.id);
      if (!currentData) throw new Error('User data not found');
      
      const updatedData = { ...currentData, ...updates };
      UserService.saveUserData(user.id, updatedData);
    } catch (error) {
      console.error('User data update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    getUserData,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for getting user's API key
export function useAPIKey(provider: 'gemini' | 'openai' | 'anthropic' = 'gemini'): string | null {
  const { user, isAuthenticated } = useAuth();
  
  if (!user || !isAuthenticated) {
    // Only for true guest users (not authenticated), check global storage for backwards compatibility
    return localStorage.getItem('geminiApiKey') || null;
  }
  
  // For authenticated users, only return their personal API key (no fallback to global storage)
  return UserService.getActiveAPIKey(user.id, provider);
}

// Hook for saving user's API key
export function useSaveAPIKey() {
  const { user, isAuthenticated } = useAuth();
  
  return async (key: string, name: string, provider: 'gemini' | 'openai' | 'anthropic' = 'gemini'): Promise<{ success: boolean; error?: string }> => {
    if (!user || !isAuthenticated) {
      // For guest users, save to global storage (backwards compatibility)
      try {
        localStorage.setItem('geminiApiKey', key);
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Failed to save API key' };
      }
    }
    
    return UserService.saveAPIKey(user.id, key, name, provider);
  };
} 