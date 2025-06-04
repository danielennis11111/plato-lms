import { 
  User, 
  UserCredentials, 
  UserRegistration, 
  UserSession, 
  UserData, 
  UserAPIKey,
  createGuestUser,
  validateEmail,
  validatePassword
} from '@/types/user';

// Simple encryption for API keys (in production, use proper encryption)
const ENCRYPTION_KEY = 'plato-lms-key-2024';

const simpleEncrypt = (text: string): string => {
  return btoa(text + ENCRYPTION_KEY);
};

const simpleDecrypt = (encrypted: string): string => {
  try {
    const decoded = atob(encrypted);
    return decoded.replace(ENCRYPTION_KEY, '');
  } catch {
    return '';
  }
};

// Generate a simple token (in production, use JWT or similar)
const generateToken = (): string => {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Hash password (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  return btoa(password + 'salt_2024');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export class UserService {
  private static readonly STORAGE_KEYS = {
    USERS: 'plato_users',
    CURRENT_SESSION: 'plato_current_session',
    USER_DATA: 'plato_user_data',
  };

  // Get all registered users
  private static getUsers(): User[] {
    try {
      const users = localStorage.getItem(this.STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  // Save users to storage
  private static saveUsers(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Get current session
  static getCurrentSession(): UserSession | null {
    try {
      const session = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
      if (!session) return null;
      
      const parsed = JSON.parse(session);
      
      // Check if session is expired
      if (new Date() > new Date(parsed.expiresAt)) {
        this.clearSession();
        return null;
      }
      
      return parsed;
    } catch {
      return null;
    }
  }

  // Save session
  private static saveSession(session: UserSession): void {
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  }

  // Clear session
  static clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
  }

  // Get user data
  static getUserData(userId: string): UserData | null {
    try {
      const allUserData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (!allUserData) return null;
      
      const parsed = JSON.parse(allUserData);
      return parsed[userId] || null;
    } catch {
      return null;
    }
  }

  // Save user data
  static saveUserData(userId: string, data: UserData): void {
    try {
      const allUserData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      const parsed = allUserData ? JSON.parse(allUserData) : {};
      
      parsed[userId] = data;
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(parsed));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Register new user
  static async register(registration: UserRegistration): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Validation
      if (!validateEmail(registration.email)) {
        return { success: false, error: 'Invalid email address' };
      }

      const passwordValidation = validatePassword(registration.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors[0] };
      }

      if (registration.password !== registration.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (!registration.agreedToTerms) {
        return { success: false, error: 'You must agree to the terms and conditions' };
      }

      // Check if user already exists
      const users = this.getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === registration.email.toLowerCase());
      
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Create new user
      const now = new Date().toISOString();
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: registration.email.toLowerCase(),
        name: `${registration.firstName} ${registration.lastName}`,
        createdAt: now,
        lastLoginAt: now,
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: {
            email: true,
            browser: true,
            assignments: true,
            discussions: true,
            grades: true,
          },
          accessibility: {
            highContrast: false,
            fontSize: 'medium',
            reducedMotion: false,
          },
          privacy: {
            profileVisibility: 'private',
            shareProgress: false,
            allowAnalytics: true,
          },
        },
        profile: {
          firstName: registration.firstName,
          lastName: registration.lastName,
          learningGoals: [],
          academicLevel: 'other',
          subjectInterests: [],
          preferredLearningStyle: 'mixed',
        },
      };

      // Save user with hashed password
      const userWithPassword = {
        ...newUser,
        passwordHash: hashPassword(registration.password),
      };

      users.push(userWithPassword);
      this.saveUsers(users);

      // Initialize user data
      const initialUserData: UserData = {
        chatHistories: {},
        courseProgress: {},
        settings: newUser.preferences,
        apiKeys: [],
        personalNotes: {},
        bookmarks: [],
      };

      this.saveUserData(newUser.id, initialUserData);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // Login user
  static async login(credentials: UserCredentials): Promise<{ success: boolean; error?: string; session?: UserSession }> {
    try {
      if (!validateEmail(credentials.email)) {
        return { success: false, error: 'Invalid email address' };
      }

      const users = this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const userWithPassword = user as any;
      if (!verifyPassword(credentials.password, userWithPassword.passwordHash)) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Update last login
      user.lastLoginAt = new Date().toISOString();
      this.saveUsers(users);

      // Create session
      const session: UserSession = {
        user,
        token: generateToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        isAuthenticated: true,
      };

      this.saveSession(session);

      return { success: true, session };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Logout user
  static logout(): void {
    this.clearSession();
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User['profile']>): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      users[userIndex].profile = { ...users[userIndex].profile, ...updates };
      users[userIndex].name = `${users[userIndex].profile.firstName} ${users[userIndex].profile.lastName}`;
      
      this.saveUsers(users);

      // Update session if it's the current user
      const currentSession = this.getCurrentSession();
      if (currentSession && currentSession.user.id === userId) {
        currentSession.user = users[userIndex];
        this.saveSession(currentSession);
      }

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Update user preferences
  static async updatePreferences(userId: string, updates: Partial<User['preferences']>): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      users[userIndex].preferences = { ...users[userIndex].preferences, ...updates };
      this.saveUsers(users);

      // Update user data settings
      const userData = this.getUserData(userId);
      if (userData) {
        userData.settings = users[userIndex].preferences;
        this.saveUserData(userId, userData);
      }

      // Update session if it's the current user
      const currentSession = this.getCurrentSession();
      if (currentSession && currentSession.user.id === userId) {
        currentSession.user = users[userIndex];
        this.saveSession(currentSession);
      }

      return { success: true };
    } catch (error) {
      console.error('Preferences update error:', error);
      return { success: false, error: 'Failed to update preferences' };
    }
  }

  // API Key Management
  static async saveAPIKey(userId: string, key: string, name: string, provider: 'gemini' | 'openai' | 'anthropic'): Promise<{ success: boolean; error?: string }> {
    try {
      const userData = this.getUserData(userId);
      if (!userData) {
        return { success: false, error: 'User data not found' };
      }

      const apiKey: UserAPIKey = {
        id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        keyHash: simpleEncrypt(key),
        name,
        provider,
        isActive: true,
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };

      // Deactivate other keys of the same provider
      userData.apiKeys = userData.apiKeys.map(k => 
        k.provider === provider ? { ...k, isActive: false } : k
      );

      userData.apiKeys.push(apiKey);
      this.saveUserData(userId, userData);

      return { success: true };
    } catch (error) {
      console.error('API key save error:', error);
      return { success: false, error: 'Failed to save API key' };
    }
  }

  static getActiveAPIKey(userId: string, provider: 'gemini' | 'openai' | 'anthropic'): string | null {
    try {
      const userData = this.getUserData(userId);
      if (!userData) return null;

      const activeKey = userData.apiKeys.find(k => k.provider === provider && k.isActive);
      if (!activeKey) return null;

      return simpleDecrypt(activeKey.keyHash);
    } catch {
      return null;
    }
  }

  // Create guest session for demo users
  static createGuestSession(): UserSession {
    const guestUser = createGuestUser();
    
    const session: UserSession = {
      user: guestUser,
      token: 'guest_token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isAuthenticated: false, // Guest users are not truly authenticated
    };

    return session;
  }

  // Initialize demo data for new users
  static initializeDemoData(userId: string): void {
    const userData = this.getUserData(userId);
    if (!userData) return;

    // Initialize with empty but structured data
    if (Object.keys(userData.courseProgress).length === 0) {
      // User can discover courses through the app
      userData.courseProgress = {};
    }

    this.saveUserData(userId, userData);
  }
} 