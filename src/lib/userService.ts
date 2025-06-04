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
const ENCRYPTION_KEY = 'plato-lms-key-2025';

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
  return btoa(password + 'salt_2025');
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
    let userData = this.getUserData(userId);
    
    // If no user data exists, create initial structure
    if (!userData) {
      console.log('🔧 Creating initial user data for:', userId);
      userData = {
        chatHistories: {},
        courseProgress: {},
        settings: {
          theme: 'system' as const,
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            browser: true,
            assignments: true,
            discussions: true,
            grades: true,
          },
          accessibility: {
            highContrast: false,
            fontSize: 'medium' as const,
            reducedMotion: false,
          },
          privacy: {
            profileVisibility: 'private' as const,
            shareProgress: false,
            allowAnalytics: true,
          },
        },
        apiKeys: [],
        personalNotes: {},
        bookmarks: [],
      };
    }

    // Initialize with empty but structured data if needed
    if (!userData.courseProgress) {
      userData.courseProgress = {};
    }
    
    if (!userData.apiKeys) {
      userData.apiKeys = [];
    }
    
    if (!userData.personalNotes) {
      userData.personalNotes = {};
    }
    
    if (!userData.bookmarks) {
      userData.bookmarks = [];
    }

    this.saveUserData(userId, userData);
    console.log('✅ User data initialized for:', userId, 'with courseProgress keys:', Object.keys(userData.courseProgress));
  }

  // Initialize test accounts with predefined data
  static initializeTestAccounts(): void {
    const existingUsers = this.getUsers();
    
    // Test Account 1: Student with enrolled courses and progress
    const testStudent1Id = 'test_student_1';
    if (!existingUsers.find(u => u.id === testStudent1Id)) {
      const testStudent1: User = {
        id: testStudent1Id,
        email: 'student@plato.edu',
        name: 'Alex Chen',
        profile: {
          firstName: 'Alex',
          lastName: 'Chen',
          bio: 'Computer Science student passionate about web development and machine learning.',
          avatar: '',
          learningGoals: ['Master React and Next.js', 'Learn machine learning fundamentals', 'Build full-stack applications'],
          academicLevel: 'undergraduate',
          subjectInterests: ['Web Development', 'Machine Learning', 'Database Systems'],
          preferredLearningStyle: 'visual'
        },
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            browser: true,
            assignments: true,
            discussions: true,
            grades: true
          },
          accessibility: {
            highContrast: false,
            fontSize: 'medium',
            reducedMotion: false
          },
          privacy: {
            profileVisibility: 'public',
            shareProgress: true,
            allowAnalytics: true
          }
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      // Add password hash (store as property on the object, not in type)
      (testStudent1 as any).passwordHash = hashPassword('Student123!');
      existingUsers.push(testStudent1);

      // Create user data with course progress
      const testStudent1Data: UserData = {
        chatHistories: {},
        settings: testStudent1.preferences,
        apiKeys: [],
        personalNotes: {
          'course-1': 'Need to focus more on React hooks and state management patterns.',
          'course-2': 'Great progress on ML algorithms. Consider exploring deep learning next.',
          'assignment-5': 'REST API project - remember to implement proper error handling'
        },
        bookmarks: [
          {
            id: 'bookmark_1',
            userId: testStudent1Id,
            title: 'React Hooks Documentation',
            url: '/courses/1/modules/1/items/1',
            type: 'page',
            itemId: '1',
            createdAt: new Date().toISOString(),
            tags: ['react', 'hooks', 'documentation']
          },
          {
            id: 'bookmark_2',
            userId: testStudent1Id,
            title: 'Machine Learning Cheat Sheet',
            url: '/courses/2/modules/2',
            type: 'course',
            itemId: '2',
            createdAt: new Date().toISOString(),
            tags: ['machine-learning', 'reference']
          }
        ],
        courseProgress: {
          '1': { // Advanced Web Development
            courseId: '1',
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedModules: ['1', '2'],
            assignmentSubmissions: {
              '2': { grade: 92, submittedAt: new Date().toISOString() },
              '3': { grade: 88, submittedAt: new Date().toISOString() }
            },
            quizAttempts: {
              '2': [{ score: 92, attemptedAt: new Date().toISOString() }]
            },
            discussionParticipation: {},
            currentGrade: 90,
            timeSpent: 450
          },
          '2': { // Machine Learning Fundamentals  
            courseId: '2',
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedModules: ['1'],
            assignmentSubmissions: {
              '11': { grade: 95, submittedAt: new Date().toISOString() },
              '12': { grade: 89, submittedAt: new Date().toISOString() }
            },
            quizAttempts: {},
            discussionParticipation: {},
            currentGrade: 92,
            timeSpent: 380
          },
          '3': { // Database Systems Architecture
            courseId: '3',
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedModules: ['1'],
            assignmentSubmissions: {},
            quizAttempts: {
              '19': [{ score: 78, attemptedAt: new Date().toISOString() }]
            },
            discussionParticipation: {},
            currentGrade: 78,
            timeSpent: 120
          }
        }
      };

      this.saveUserData(testStudent1Id, testStudent1Data);
    }

    // Test Account 2: New student with blank slate
    const testStudent2Id = 'test_student_2';
    if (!existingUsers.find(u => u.id === testStudent2Id)) {
      const testStudent2: User = {
        id: testStudent2Id,
        email: 'newstudent@plato.edu',
        name: 'Jordan Smith',
        profile: {
          firstName: 'Jordan',
          lastName: 'Smith', 
          bio: 'New to programming, excited to learn!',
          avatar: '',
          learningGoals: ['Learn programming fundamentals', 'Build my first web app'],
          academicLevel: 'undergraduate',
          subjectInterests: ['Programming', 'Web Development'],
          preferredLearningStyle: 'kinesthetic'
        },
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'America/Los_Angeles',
          notifications: {
            email: true,
            browser: false,
            assignments: true,
            discussions: false,
            grades: true
          },
          accessibility: {
            highContrast: false,
            fontSize: 'medium',
            reducedMotion: false
          },
          privacy: {
            profileVisibility: 'private',
            shareProgress: false,
            allowAnalytics: true
          }
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      // Add password hash (store as property on the object, not in type)
      (testStudent2 as any).passwordHash = hashPassword('NewStudent123!');
      existingUsers.push(testStudent2);

      // Create user data with minimal progress (blank slate)
      const testStudent2Data: UserData = {
        chatHistories: {},
        settings: testStudent2.preferences,
        apiKeys: [],
        personalNotes: {},
        bookmarks: [],
        courseProgress: {}
      };

      this.saveUserData(testStudent2Id, testStudent2Data);
    }

    // Test Account 3: English Freshman
    const testStudent3Id = 'test_student_3';
    if (!existingUsers.find(u => u.id === testStudent3Id)) {
      const testStudent3: User = {
        id: testStudent3Id,
        email: 'english.freshman@plato.edu',
        name: 'Taylor Johnson',
        profile: {
          firstName: 'Taylor',
          lastName: 'Johnson', 
          bio: 'English major freshman passionate about literature and creative writing. Looking forward to exploring different literary periods and developing my analytical writing skills.',
          avatar: '',
          learningGoals: ['Develop strong analytical writing skills', 'Explore diverse literary traditions', 'Improve close reading abilities', 'Build research and citation skills'],
          academicLevel: 'undergraduate',
          subjectInterests: ['Literature', 'Creative Writing', 'Rhetoric', 'Cultural Studies'],
          preferredLearningStyle: 'reading'
        },
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'America/Chicago',
          notifications: {
            email: true,
            browser: true,
            assignments: true,
            discussions: true,
            grades: true
          },
          accessibility: {
            highContrast: false,
            fontSize: 'medium',
            reducedMotion: false
          },
          privacy: {
            profileVisibility: 'public',
            shareProgress: true,
            allowAnalytics: true
          }
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      // Add password hash (store as property on the object, not in type)
      (testStudent3 as any).passwordHash = hashPassword('EnglishFresh123!');
      existingUsers.push(testStudent3);

      // Create user data for English freshman with enrolled courses
      const testStudent3Data: UserData = {
        chatHistories: {},
        settings: testStudent3.preferences,
        apiKeys: [],
        personalNotes: {
          'course-5': 'Excited to dive deep into literary analysis! Need to work on thesis statement clarity.',
          'course-6': 'Writing course is challenging but helpful. Focus on stronger evidence integration.',
          'assignment-101': 'First discussion post - be confident in my interpretations!',
          'assignment-103': 'Poetry analysis - remember to connect devices to meaning, not just identify them.'
        },
        bookmarks: [
          {
            id: 'bookmark_3',
            userId: testStudent3Id,
            title: 'Literary Terms Reference',
            url: '/courses/5/modules/1/items/102',
            type: 'quiz',
            itemId: '102',
            notes: 'Great review of key terms before assignments',
            createdAt: new Date().toISOString(),
            tags: ['literary-terms', 'reference', 'study-guide']
          },
          {
            id: 'bookmark_4',
            userId: testStudent3Id,
            title: 'MLA Citation Guide',
            url: '/courses/6/modules/3/items/206',
            type: 'quiz',
            itemId: '206',
            notes: 'Essential for all research papers',
            createdAt: new Date().toISOString(),
            tags: ['mla', 'citation', 'writing', 'reference']
          }
        ],
        courseProgress: {
          '5': { // Introduction to Literature
            courseId: '5',
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedModules: [],
            assignmentSubmissions: {},
            quizAttempts: {},
            discussionParticipation: {},
            currentGrade: 0,
            timeSpent: 25
          },
          '6': { // Composition and Rhetoric
            courseId: '6',
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedModules: [],
            assignmentSubmissions: {},
            quizAttempts: {},
            discussionParticipation: {},
            currentGrade: 0,
            timeSpent: 15
          }
        }
      };

      this.saveUserData(testStudent3Id, testStudent3Data);
    }

    // Save all users
    this.saveUsers(existingUsers);
  }

  // Method to get test account credentials
  static getTestAccounts(): Array<{ email: string; password: string; description: string }> {
    return [
      {
        email: 'student@plato.edu',
        password: 'Student123!',
        description: 'Test student with enrolled courses and progress'
      },
      {
        email: 'newstudent@plato.edu', 
        password: 'NewStudent123!',
        description: 'New student with blank slate for course creation'
      },
      {
        email: 'english.freshman@plato.edu',
        password: 'EnglishFresh123!',
        description: 'English freshman with Literature & Composition courses'
      }
    ];
  }
} 