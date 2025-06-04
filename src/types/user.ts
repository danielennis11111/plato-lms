export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
  profile: UserProfile;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  learningGoals: string[];
  academicLevel: 'undergraduate' | 'graduate' | 'professional' | 'other';
  subjectInterests: string[];
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    browser: boolean;
    assignments: boolean;
    discussions: boolean;
    grades: boolean;
  };
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    shareProgress: boolean;
    allowAnalytics: boolean;
  };
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: string;
  isAuthenticated: boolean;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

export interface UserAPIKey {
  id: string;
  userId: string;
  keyHash: string; // Encrypted/hashed version
  name: string; // User-friendly name for the key
  provider: 'gemini' | 'openai' | 'anthropic';
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
}

export interface UserData {
  chatHistories: { [contextKey: string]: any[] };
  courseProgress: { [courseId: string]: CourseProgress };
  settings: UserPreferences;
  apiKeys: UserAPIKey[];
  personalNotes: { [contextKey: string]: string };
  bookmarks: Bookmark[];
}

export interface CourseProgress {
  courseId: string;
  enrolledAt: string;
  lastAccessedAt: string;
  completedModules: string[];
  assignmentSubmissions: { [assignmentId: string]: any };
  quizAttempts: { [quizId: string]: any[] };
  discussionParticipation: { [discussionId: string]: any };
  currentGrade?: number;
  timeSpent: number; // in minutes
}

export interface Bookmark {
  id: string;
  userId: string;
  type: 'assignment' | 'discussion' | 'page' | 'quiz' | 'course';
  itemId: string;
  title: string;
  url: string;
  notes?: string;
  createdAt: string;
  tags: string[];
}

export interface AuthContextType {
  user: User | null;
  session: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (registration: UserRegistration) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  getUserData: () => UserData | null;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
}

// Demo/Guest user for users without accounts
export const createGuestUser = (): User => ({
  id: 'guest',
  email: 'guest@plato-lms.com',
  name: 'Guest User',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  preferences: {
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
      email: false,
      browser: false,
      assignments: false,
      discussions: false,
      grades: false,
    },
    accessibility: {
      highContrast: false,
      fontSize: 'medium',
      reducedMotion: false,
    },
    privacy: {
      profileVisibility: 'private',
      shareProgress: false,
      allowAnalytics: false,
    },
  },
  profile: {
    firstName: 'Guest',
    lastName: 'User',
    learningGoals: [],
    academicLevel: 'other',
    subjectInterests: [],
    preferredLearningStyle: 'mixed',
  },
});

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}; 