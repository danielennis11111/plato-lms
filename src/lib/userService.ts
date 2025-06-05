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
import { getASUPhotoUrl } from './mockCanvasApi';

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
      console.log('🔍 Available users during login:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));
      console.log('🔍 Looking for email:', credentials.email);
      
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      console.log('🔍 Found user:', user ? { id: user.id, email: user.email, name: user.name } : 'NOT FOUND');

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const userWithPassword = user as any;
      console.log('🔍 Checking password for user:', user.email);
      const passwordValid = verifyPassword(credentials.password, userWithPassword.passwordHash);
      console.log('🔍 Password valid:', passwordValid);
      
      if (!passwordValid) {
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

  // Initialize test accounts with predefined data
  static initializeTestAccounts(): void {
    console.log('🏗️ Starting test account initialization...');
    const existingUsers = this.getUsers();
    console.log('👥 Existing users:', existingUsers.map(u => ({ id: u.id, email: u.email })));
    
    // Test Account 1: Student with enrolled courses and progress
    const testStudent1Id = 'test_student_1';
    if (!existingUsers.find(u => u.id === testStudent1Id)) {
      console.log('🆕 Creating test student 1 (student@plato.edu)...');
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
      console.log('🔐 Password hash for student@plato.edu:', (testStudent1 as any).passwordHash);
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
      console.log('✅ Test student 1 created and data saved');
    } else {
      console.log('ℹ️ Test student 1 already exists');
    }

    // Test Account 2: New student with blank slate
    const testStudent2Id = 'test_student_2';
    if (!existingUsers.find(u => u.id === testStudent2Id)) {
      console.log('🆕 Creating test student 2 (newstudent@plato.edu)...');
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
      console.log('🔐 Password hash for newstudent@plato.edu:', (testStudent2 as any).passwordHash);
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
      console.log('✅ Test student 2 created and data saved');
    } else {
      console.log('ℹ️ Test student 2 already exists');
    }

    // Test Account 3: English Freshman
    const testStudent3Id = 'test_student_3';
    if (!existingUsers.find(u => u.id === testStudent3Id)) {
      console.log('🆕 Creating test student 3 (english.freshman@plato.edu)...');
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
      console.log('🔐 Password hash for english.freshman@plato.edu:', (testStudent3 as any).passwordHash);
      existingUsers.push(testStudent3);

      // Create user data for English freshman with enrolled courses
      const testStudent3Data: UserData = {
        chatHistories: {},
        settings: testStudent3.preferences,
        apiKeys: [],
        personalNotes: {
          'course-4': 'Excited to dive deep into literary analysis! Need to work on thesis statement clarity.',
          'course-5': 'Writing course is challenging but helpful. Focus on stronger evidence integration.',
          'assignment-101': 'First discussion post - be confident in my interpretations!',
          'assignment-103': 'Poetry analysis - remember to connect devices to meaning, not just identify them.'
        },
        bookmarks: [
          {
            id: 'bookmark_3',
            userId: testStudent3Id,
            title: 'Literary Terms Reference',
            url: '/courses/4/modules/1/items/102',
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
            url: '/courses/5/modules/1/items/202',
            type: 'quiz',
            itemId: '202',
            notes: 'Essential for all research papers',
            createdAt: new Date().toISOString(),
            tags: ['mla', 'citation', 'writing', 'reference']
          }
        ],
        courseProgress: {
          '4': { // Introduction to Literature (ENG101)
            courseId: '4',
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedModules: [],
            assignmentSubmissions: {},
            quizAttempts: {},
            discussionParticipation: {},
            currentGrade: 87,
            timeSpent: 25
          },
          '5': { // Composition and Rhetoric (ENG102)
            courseId: '5',
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedModules: [],
            assignmentSubmissions: {},
            quizAttempts: {},
            discussionParticipation: {},
            currentGrade: 91,
            timeSpent: 15
          }
        }
      };

      this.saveUserData(testStudent3Id, testStudent3Data);
      console.log('✅ Test student 3 created and data saved');
    } else {
      console.log('ℹ️ Test student 3 already exists');
    }

    // Test Account 4: Computer Science Faculty
    const testFacultyId = 'test_faculty_1';
    if (!existingUsers.find(u => u.id === testFacultyId)) {
      console.log('🆕 Creating test faculty (faculty@plato.edu)...');
      const testFaculty: User = {
        id: testFacultyId,
        email: 'faculty@plato.edu',
        name: 'Dr. Sarah Martinez',
        profile: {
          firstName: 'Sarah',
          lastName: 'Martinez',
          bio: 'Associate Professor of Computer Science with 8 years teaching experience. PhD in Software Engineering. Passionate about innovative pedagogy and student success.',
          avatar: '',
          learningGoals: ['Improve student engagement', 'Optimize course effectiveness', 'Integrate AI-assisted learning'],
          academicLevel: 'professional',
          subjectInterests: ['Web Development', 'Software Architecture', 'Database Systems', 'Educational Technology'],
          preferredLearningStyle: 'mixed'
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

      (testFaculty as any).passwordHash = hashPassword('Faculty123!');
      (testFaculty as any).role = 'instructor';
      (testFaculty as any).department = 'Computer Science & Engineering';
      (testFaculty as any).teaching_courses = [1, 3]; // Advanced Web Dev, Database Systems
      (testFaculty as any).specializations = ['Web Development', 'Software Architecture', 'Database Systems'];
      console.log('🔐 Password hash for faculty@plato.edu:', (testFaculty as any).passwordHash);
      existingUsers.push(testFaculty);

      const testFacultyData: UserData = {
        chatHistories: {},
        settings: testFaculty.preferences,
        apiKeys: [],
        personalNotes: {
          'course-1': 'Strong student engagement. Consider adding more real-world projects.',
          'course-3': 'Some students struggling with normalization concepts. Need clearer examples.',
          'teaching': 'AI assistance showing promise for personalized learning paths.'
        },
        bookmarks: [],
        courseProgress: {}
      };

      this.saveUserData(testFacultyId, testFacultyData);
      console.log('✅ Test faculty created and data saved');
    } else {
      console.log('ℹ️ Test faculty already exists');
    }

    // Test Account 5: Real ASU Instructional Designer - Sarah Jarboe
    const testDesignerId = 'test_designer_1';
    if (!existingUsers.find(u => u.id === testDesignerId)) {
      console.log('🆕 Creating ASU instructional designer Sarah Jarboe (sarah.jarboe@asu.edu)...');
      const testDesigner: User = {
        id: testDesignerId,
        email: 'sarah.jarboe@asu.edu',
        name: 'Sarah Jarboe',
        profile: {
          firstName: 'Sarah',
          lastName: 'Jarboe',
          bio: 'Instructional Designer at ASU Learning Enterprise specializing in educational technology integration, course design, and faculty development. Expert in creating engaging learning experiences across diverse academic disciplines.',
          avatar: getASUPhotoUrl('sjarboe'),
          learningGoals: ['Enhance learning design', 'Improve student engagement', 'Advance educational technology'],
          academicLevel: 'professional',
          subjectInterests: ['Instructional Design', 'Educational Technology', 'Learning Analytics', 'Faculty Development', 'Course Architecture'],
          preferredLearningStyle: 'mixed'
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

      (testDesigner as any).passwordHash = hashPassword('Staff123!');
      (testDesigner as any).role = 'instructional_designer';
      (testDesigner as any).department = 'Learning Enterprise';
      (testDesigner as any).office = '777 S. Novus Place Ste. 320, Tempe, AZ 85281';
      (testDesigner as any).mailCode = '8708';
      (testDesigner as any).campus = 'Scottsdale';
      (testDesigner as any).teaching_courses = []; // Oversees course design across departments
      (testDesigner as any).specializations = ['Instructional Design', 'Educational Technology', 'Learning Analytics', 'Faculty Development'];
      console.log('🔐 Password hash for sarah.jarboe@asu.edu:', (testDesigner as any).passwordHash);
      existingUsers.push(testDesigner);

      const testDesignerData: UserData = {
        chatHistories: {},
        settings: testDesigner.preferences,
        apiKeys: [],
        personalNotes: {
          'learning-analytics': 'Seeing great success with adaptive learning technologies across programs.',
          'faculty-development': 'Planning workshop series on inclusive course design practices.',
          'course-quality': 'Regular quality assurance reviews showing improvement in student engagement.'
        },
        bookmarks: [],
        courseProgress: {}
      };

      this.saveUserData(testDesignerId, testDesignerData);
      console.log('✅ Test instructional designer created and data saved');
    } else {
      console.log('ℹ️ Test instructional designer already exists');
    }

    // Additional ASU-inspired Faculty Accounts
    const facultyAccounts = [
      {
        id: 'faculty_werner',
        email: 'jennifer.werner.2@asu.edu',
        name: 'Jennifer Werner',
        department: 'Mary Lou Fulton Teachers College',
        courses: [13], // EDT 180 - Technology Literacy
        specializations: ['Technology Literacy', 'Digital Technology Applications', 'Problem Solving', 'Educational Technology', 'AI Learning Strategies'],
        bio: 'AI Learning Strategist at ASU Learning Experience. Expert in technology literacy and problem-solving using digital technology applications. Teaches EDT 180 focusing on 21st-century skills and digital technologies in society.',
        profileImage: getASUPhotoUrl('jwerner9'),
        office: 'FAB - West S273B, Glendale, AZ',
        phone: 'Contact via email'
      },
      {
        id: 'faculty_chakravarthi',
        email: 'bshettah@asu.edu',
        name: 'Dr. Bharatesh Chakravarthi',
        department: 'School of Computing and Augmented Intelligence',
        courses: [10], // CSE463 - Human-Computer Interaction
        specializations: ['Human-Computer Interaction', 'Computer Graphics', 'Virtual Reality', 'Multimodal Vision', 'Artificial Intelligence'],
        bio: 'Assistant Teaching Professor at SCAI. PhD in Computer Graphics and Virtual Reality from Chung-Ang University, Seoul. Research focuses on multimodal vision and AI, intelligent transportation systems, and 3D interactions in VR. Teaches CSE 463 - Introduction to Human-Computer Interaction.',
        profileImage: getASUPhotoUrl('bshettah'),
        office: 'BYENG M1-40, Tempe, AZ 85281',
        phone: 'Contact via email',
        mailCode: '8809',
        campus: 'Tempe'
      },
      {
        id: 'faculty_chen',
        email: 'y.chen@plato.edu',
        name: 'Dr. Yinong Chen',
        department: 'Computer Science & Engineering',
        courses: [11], // CSE445 - Distributed Software Development
        specializations: ['Service-Oriented Computing', 'Visual Programming', 'Big Data Processing', 'Machine Learning', 'Robotics and AI', 'Computer Science Education'],
        bio: 'Teaching Professor in the School of Computing and Augmented Intelligence. PhD from University of Karlsruhe/KIT, Germany (1993). Author of 10+ textbooks and 500+ research papers. Expert in Software Engineering, Service-Oriented Computing, Visual Programming, and Computer Science Education.',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        office: 'BYENG M1-06',
        phone: '480-965-2769'
      },
      {
        id: 'faculty_jaskie',
        email: 'k.jaskie@plato.edu',
        name: 'Dr. Kristen Jaskie',
        department: 'Computer Science & Engineering',
        courses: [12], // CSE475 - Machine Learning
        specializations: ['Machine Learning', 'Semi-Supervised Learning', 'Positive Unlabeled Learning'],
        bio: 'Machine learning research scientist and educator with expertise in semi-supervised learning and the positive unlabeled learning problem. PhD in Signal Processing and Machine Learning, author of multiple ML papers and book on Positive Unlabeled Learning.',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        office: 'ENGR 320',
        phone: '480-965-4567'
      },
      {
        id: 'faculty_green',
        email: 'r.green@plato.edu',
        name: 'Dr. Rachel Green',
        department: 'Life Sciences',
        courses: [8], // BIO130 - Environmental Science
        specializations: ['Environmental Science', 'Ecology', 'Sustainability Studies'],
        bio: 'Environmental scientist specializing in ecosystem dynamics, conservation biology, and environmental policy. Research focuses on climate change impacts and sustainable resource management practices.',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        office: 'LSC 425',
        phone: '480-965-5678'
      },
      {
        id: 'faculty_kumar',
        email: 'd.kumar@plato.edu',
        name: 'Prof. David Kumar',
        department: 'Mechanical & Aerospace Engineering',
        courses: [9], // FSE100 - Introduction to Engineering
        specializations: ['Engineering Design', 'Project Management', 'STEM Education'],
        bio: 'Engineering educator passionate about introducing students to the engineering profession. Expertise in design thinking, project-based learning, and technical communication for first-year engineering students.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        office: 'ENGR 110',
        phone: '480-965-6789'
      }
    ];

    facultyAccounts.forEach(faculty => {
      if (!existingUsers.find(u => u.id === faculty.id)) {
        console.log(`🆕 Creating faculty account (${faculty.email})...`);
        const facultyUser: User = {
          id: faculty.id,
          email: faculty.email,
          name: faculty.name,
          profile: {
            firstName: faculty.name.split(' ')[1] || faculty.name,
            lastName: faculty.name.split(' ').slice(2).join(' ') || '',
            bio: faculty.bio,
            avatar: (faculty as any).profileImage || '',
            learningGoals: ['Enhance teaching effectiveness', 'Improve student engagement', 'Integrate educational technology'],
            academicLevel: 'professional',
            subjectInterests: faculty.specializations,
            preferredLearningStyle: 'mixed'
          },
          preferences: {
            theme: 'light',
            language: 'en',
            timezone: 'America/Phoenix',
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

        (facultyUser as any).passwordHash = hashPassword('Faculty123!');
        (facultyUser as any).role = 'instructor';
        (facultyUser as any).department = faculty.department;
        (facultyUser as any).teaching_courses = faculty.courses;
        (facultyUser as any).specializations = faculty.specializations;
        console.log(`🔐 Password hash for ${faculty.email}:`, (facultyUser as any).passwordHash);
        existingUsers.push(facultyUser);

        // Create courseProgress entries for faculty teaching courses
        const facultyCourseProgress: Record<string, any> = {};
        faculty.courses.forEach(courseId => {
          facultyCourseProgress[courseId.toString()] = {
            courseId: courseId.toString(),
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedModules: [],
            assignmentSubmissions: {},
            quizAttempts: {},
            discussionParticipation: {},
            currentGrade: 0,
            timeSpent: 0
          };
        });

        const facultyData: UserData = {
          chatHistories: {},
          settings: facultyUser.preferences,
          apiKeys: [],
          personalNotes: {
            [`course-${faculty.courses[0]}`]: 'Looking forward to engaging with students this semester.',
            'teaching': 'Focus on active learning and real-world applications.'
          },
          bookmarks: [],
          courseProgress: facultyCourseProgress
        };

        this.saveUserData(faculty.id, facultyData);
        console.log(`✅ Faculty ${faculty.name} created and data saved`);
      } else {
        console.log(`ℹ️ Faculty ${faculty.name} already exists`);
      }
    });

    // Additional Diverse Student Accounts
    const studentAccounts = [
      {
        id: 'student_cs_sophomore',
        email: 'alex.cs@plato.edu',
        name: 'Alex Chen',
        major: 'Computer Science',
        year: 'sophomore',
        courses: [7, 10, 11], // CSE205, CSE463, CSE445
        bio: 'Computer Science sophomore passionate about software development and user experience design. Active in coding bootcamps and hackathons.',
        interests: ['Software Development', 'UI/UX Design', 'Algorithms'],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        password: 'Student123!'
      },
      {
        id: 'student_engineering_junior',
        email: 'maria.eng@plato.edu',
        name: 'Maria Rodriguez',
        major: 'Mechanical Engineering',
        year: 'junior',
        courses: [9], // FSE100
        bio: 'Junior mechanical engineering student interested in sustainable design and renewable energy systems. Plans to pursue graduate studies in environmental engineering.',
        interests: ['Sustainable Design', 'Renewable Energy', 'Project Management'],
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        password: 'Student123!'
      },
      {
        id: 'student_bio_senior',
        email: 'james.bio@plato.edu',
        name: 'James Williams',
        major: 'Biology',
        year: 'senior',
        courses: [8], // BIO130
        bio: 'Senior biology major focused on environmental conservation and field research. Planning to pursue a PhD in ecology after graduation.',
        interests: ['Environmental Conservation', 'Field Research', 'Ecology'],
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        password: 'Student123!'
      },
      {
        id: 'student_ml_grad',
        email: 'priya.ml@plato.edu',
        name: 'Priya Patel',
        major: 'Computer Science',
        year: 'graduate',
        courses: [12], // CSE475 - Machine Learning
        bio: 'Graduate student researching machine learning applications in healthcare. Background in biomedical engineering with focus on AI-driven diagnostic tools.',
        interests: ['Machine Learning', 'Healthcare AI', 'Biomedical Engineering'],
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        password: 'Student123!'
      }
    ];

    // Graduate Teaching Assistant Account
    const graduateTA = {
      id: 'graduate_ta_ikediuwa',
      email: 'ezinwanne.ikediuwa@asu.edu',
      name: 'Ezinwanne Ikediuwa',
      department: 'TCLAS School of Molecular Sciences',
      courses: [10], // Assists with CSE463 - Human-Computer Interaction
      role: 'Graduate Teaching Assistant',
      year: 'graduate',
      major: 'Chemistry',
      bio: 'Graduate Service Assistant and PhD student in Chemistry at Dr G.F. Moore\'s Lab. B.S in Pure and Industrial Chemistry from University of Nigeria, Nsukka (2013), MS in Organic Chemistry (2023). Research focus on electrochemistry and organic synthetic chemistry.',
      interests: ['Electrochemistry', 'Organic Synthetic Chemistry', 'Graduate Research'],
      profileImage: getASUPhotoUrl('ezinwanne.ikediuwa'),
      office: 'Contact via email',
      phone: 'Contact via email',
      mailCode: '1604',
      campus: 'Tempe',
      password: 'Student123!'
    };

    if (!existingUsers.find(u => u.id === graduateTA.id)) {
      console.log(`🆕 Creating graduate TA account (${graduateTA.email})...`);
      const taUser: User = {
        id: graduateTA.id,
        email: graduateTA.email,
        name: graduateTA.name,
        profile: {
          firstName: graduateTA.name.split(' ')[0],
          lastName: graduateTA.name.split(' ')[1] || '',
          bio: graduateTA.bio,
          avatar: graduateTA.profileImage,
          learningGoals: ['Complete PhD research', 'Develop teaching skills', 'Advance research in chemistry'],
          academicLevel: 'graduate',
          subjectInterests: graduateTA.interests,
          preferredLearningStyle: 'mixed'
        },
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'America/Phoenix',
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

      (taUser as any).passwordHash = hashPassword(graduateTA.password);
      (taUser as any).role = 'teaching_assistant';
      (taUser as any).department = graduateTA.department;
      (taUser as any).major = graduateTA.major;
      (taUser as any).academicYear = graduateTA.year;
      (taUser as any).mailCode = graduateTA.mailCode;
      (taUser as any).campus = graduateTA.campus;
      console.log(`🔐 Password hash for ${graduateTA.email}:`, (taUser as any).passwordHash);
      existingUsers.push(taUser);

      const courseProgress: { [key: string]: any } = {};
      graduateTA.courses.forEach(courseId => {
        courseProgress[courseId.toString()] = {
          courseId: courseId.toString(),
          enrolledAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          completedModules: [],
          assignmentSubmissions: {},
          quizAttempts: {},
          discussionParticipation: {},
          currentGrade: 0,
          timeSpent: Math.floor(Math.random() * 10) + 2
        };
      });

      const taData: UserData = {
        chatHistories: {},
        settings: taUser.preferences,
        apiKeys: [],
        personalNotes: {
          [`course-${graduateTA.courses[0]}`]: 'Assisting with CSE463 - Human-Computer Interaction course.',
          'research': 'Focusing on electrochemistry and organic synthetic chemistry research in Dr. Moore\'s lab.'
        },
        bookmarks: [],
        courseProgress
      };

      this.saveUserData(graduateTA.id, taData);
      console.log(`✅ Graduate TA ${graduateTA.name} created and data saved`);
    } else {
      console.log(`ℹ️ Graduate TA ${graduateTA.name} already exists`);
    }

    studentAccounts.forEach(student => {
      if (!existingUsers.find(u => u.id === student.id)) {
        console.log(`🆕 Creating student account (${student.email})...`);
        const studentUser: User = {
          id: student.id,
          email: student.email,
          name: student.name,
          profile: {
            firstName: student.name.split(' ')[0],
            lastName: student.name.split(' ')[1] || '',
            bio: student.bio,
            avatar: (student as any).profileImage || '',
            learningGoals: ['Excel in coursework', 'Build practical skills', 'Prepare for career'],
            academicLevel: student.year === 'graduate' ? 'graduate' : 'undergraduate',
            subjectInterests: student.interests,
            preferredLearningStyle: 'mixed'
          },
          preferences: {
            theme: 'light',
            language: 'en',
            timezone: 'America/Phoenix',
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

        (studentUser as any).passwordHash = hashPassword(student.password);
        (studentUser as any).major = student.major;
        (studentUser as any).academicYear = student.year;
        console.log(`🔐 Password hash for ${student.email}:`, (studentUser as any).passwordHash);
        existingUsers.push(studentUser);

        const courseProgress: { [key: string]: any } = {};
        student.courses.forEach(courseId => {
          courseProgress[courseId.toString()] = {
            courseId: courseId.toString(),
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedModules: [],
            assignmentSubmissions: {},
            quizAttempts: {},
            discussionParticipation: {},
            currentGrade: 0,
            timeSpent: Math.floor(Math.random() * 20) + 5
          };
        });

        const studentData: UserData = {
          chatHistories: {},
          settings: studentUser.preferences,
          apiKeys: [],
          personalNotes: {
            [`course-${student.courses[0]}`]: `Excited to be taking ${student.major} courses this semester!`,
            'academic': `${student.year} year focus: building expertise in ${student.interests[0]}.`
          },
          bookmarks: [],
          courseProgress
        };

        this.saveUserData(student.id, studentData);
        console.log(`✅ Student ${student.name} created and data saved`);
      } else {
        console.log(`ℹ️ Student ${student.name} already exists`);
      }
    });

    // Save all users
    console.log('💾 Saving all users to localStorage...');
    this.saveUsers(existingUsers);
    console.log('✅ All test accounts initialized. Final user count:', existingUsers.length);
  }

  // Method to force refresh all test accounts (useful for debugging)
  static refreshTestAccounts(): void {
    console.log('🔄 Force refreshing all test accounts...');
    
    // Clear existing users
    localStorage.removeItem(this.STORAGE_KEYS.USERS);
    localStorage.removeItem(this.STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
    
    // Reinitialize everything
    this.initializeTestAccounts();
    console.log('✅ Test accounts refreshed');
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
      },
      {
        email: 'faculty@plato.edu',
        password: 'Faculty123!',
        description: 'CS Professor teaching multiple courses'
      },
      {
        email: 'jennifer.werner.2@asu.edu',
        password: 'Faculty123!',
        description: 'Jennifer Werner - Technology Literacy Faculty (ASU)'
      },
      {
        email: 'sarah.jarboe@asu.edu',
        password: 'Staff123!',
        description: 'Sarah Jarboe - Instructional Designer (ASU Learning Enterprise)'
      },
      {
        email: 'bshettah@asu.edu',
        password: 'Faculty123!',
        description: 'Dr. Bharatesh Chakravarthi - HCI Assistant Teaching Professor (ASU)'
      },
      {
        email: 'y.chen@plato.edu',
        password: 'Faculty123!',
        description: 'Dr. Yinong Chen - Distributed Systems Professor'
      },
      {
        email: 'k.jaskie@plato.edu',
        password: 'Faculty123!',
        description: 'Dr. Kristen Jaskie - Machine Learning Professor'
      },
      {
        email: 'r.green@plato.edu',
        password: 'Faculty123!',
        description: 'Dr. Rachel Green - Environmental Science Professor'
      },
      {
        email: 'd.kumar@plato.edu',
        password: 'Faculty123!',
        description: 'Prof. David Kumar - Engineering Design Professor'
      },
      {
        email: 'alex.cs@plato.edu',
        password: 'Student123!',
        description: 'Alex Chen - CS Sophomore (Software Dev & UX)'
      },
      {
        email: 'maria.eng@plato.edu',
        password: 'Student123!',
        description: 'Maria Rodriguez - Mechanical Engineering Junior'
      },
      {
        email: 'james.bio@plato.edu',
        password: 'Student123!',
        description: 'James Williams - Biology Senior (Environmental Focus)'
      },
      {
        email: 'priya.ml@plato.edu',
        password: 'Student123!',
        description: 'Priya Patel - Graduate Student (ML & Healthcare AI)'
      },
      {
        email: 'ezinwanne.ikediuwa@asu.edu',
        password: 'Student123!',
        description: 'Ezinwanne Ikediuwa - Graduate TA (Chemistry PhD)'
      }
    ];
  }
} 