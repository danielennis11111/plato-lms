// Debug utility for ProfileSwitcher issues
export const debugProfileSwitcher = {
  // Check what happens when we try to switch to Sarah Jarboe
  testSarahJarboeSwitch() {
    console.group('🔍 Debug: Sarah Jarboe Profile Switch');
    
    // Get current session
    const currentSession = localStorage.getItem('plato_current_session');
    console.log('Current session:', currentSession ? JSON.parse(currentSession) : 'None');
    
    // Check if Sarah's test account exists
    const { UserService } = require('./userService');
    const testAccounts = UserService.getTestAccounts();
    const sarahAccount = testAccounts.find((acc: any) => acc.email === 'sarah.jarboe@asu.edu');
    console.log('Sarah test account exists:', !!sarahAccount);
    if (sarahAccount) {
      console.log('Sarah account details:', sarahAccount);
    }
    
    // Check users in storage
    const users = JSON.parse(localStorage.getItem('plato_users') || '[]');
    const sarahUser = users.find((u: any) => u.email === 'sarah.jarboe@asu.edu');
    console.log('Sarah user in storage:', !!sarahUser);
    if (sarahUser) {
      console.log('Sarah user details:', { id: sarahUser.id, name: sarahUser.name, email: sarahUser.email });
    }
    
    console.groupEnd();
  },

  // Manually create a demo session for Sarah
  createSarahDemoSession() {
    console.log('🔧 Creating manual demo session for Sarah Jarboe...');
    
    const demoUser = {
      id: 'test_designer_1',
      email: 'sarah.jarboe@asu.edu',
      name: 'Sarah Jarboe',
      profile: {
        firstName: 'Sarah',
        lastName: 'Jarboe',
        bio: 'Instructional Designer - Learning Enterprise',
        avatar: '',
        learningGoals: ['Demo profile for testing'],
        academicLevel: 'professional',
        subjectInterests: ['Instructional Design'],
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
    
    const demoSession = {
      user: demoUser,
      token: `demo_sarah_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem('plato_current_session', JSON.stringify(demoSession));
    console.log('✅ Demo session created for Sarah. Reloading page...');
    window.location.reload();
  },

  // Check ProfileSwitcher setup
  checkProfileSwitcherSetup() {
    console.group('🔍 ProfileSwitcher Setup Check');
    
    // This would need to be run from the browser where the component is loaded
    console.log('Note: Run this in browser console where ProfileSwitcher is available');
    console.log('Check if getASUPhotoUrl function is working');
    
    // Test the ASU photo URL function
    try {
      const { getASUPhotoUrl } = require('./mockCanvasApi');
      const sarahPhotoUrl = getASUPhotoUrl('sjarboe');
      console.log('Sarah photo URL:', sarahPhotoUrl);
    } catch (error) {
      console.error('Error getting ASU photo URL:', error);
    }
    
    console.groupEnd();
  },

  // List all profiles that should be available
  listAllProfiles() {
    console.group('🔍 All Available Profiles');
    
    const profiles = [
      { id: 'test_student_1', name: 'Emily Parker', email: 'student@plato.edu', category: 'Students' },
      { id: 'test_student_2', name: 'Marcus Thompson', email: 'newstudent@plato.edu', category: 'Students' },
      { id: 'test_student_3', name: 'Isabella Chen', email: 'english.freshman@plato.edu', category: 'Students' },
      { id: 'student_cs_sophomore', name: 'Alex Chen', email: 'alex.cs@plato.edu', category: 'Students' },
      { id: 'student_engineering_junior', name: 'Maria Rodriguez', email: 'maria.eng@plato.edu', category: 'Students' },
      { id: 'student_bio_senior', name: 'James Williams', email: 'james.bio@plato.edu', category: 'Students' },
      { id: 'student_ml_grad', name: 'Priya Patel', email: 'priya.ml@plato.edu', category: 'Students' },
      { id: 'test_faculty_1', name: 'Dr. Sarah Martinez', email: 'faculty@plato.edu', category: 'Faculty' },
      { id: 'faculty_chen', name: 'Dr. Yinong Chen', email: 'y.chen@plato.edu', category: 'Faculty' },
      { id: 'faculty_chakravarthi', name: 'Dr. Bharatesh Chakravarthi', email: 'bshettah@asu.edu', category: 'Faculty' },
      { id: 'faculty_jaskie', name: 'Dr. Kristen Jaskie', email: 'k.jaskie@plato.edu', category: 'Faculty' },
      { id: 'faculty_green', name: 'Dr. Rachel Green', email: 'r.green@plato.edu', category: 'Faculty' },
      { id: 'faculty_kumar', name: 'Prof. David Kumar', email: 'd.kumar@plato.edu', category: 'Faculty' },
      { id: 'faculty_werner', name: 'Jennifer Werner', email: 'jennifer.werner.2@asu.edu', category: 'Faculty' },
      { id: 'test_designer_1', name: 'Sarah Jarboe', email: 'sarah.jarboe@asu.edu', category: 'Staff' },
      { id: 'graduate_ta_ikediuwa', name: 'Ezinwanne Ikediuwa', email: 'ezinwanne.ikediuwa@asu.edu', category: 'Students' }
    ];

    const users = JSON.parse(localStorage.getItem('plato_users') || '[]');
    const { UserService } = require('./userService');
    const testAccounts = UserService.getTestAccounts();

    profiles.forEach(profile => {
      const userExists = users.find((u: any) => u.email === profile.email);
      const testAccountExists = testAccounts.find((acc: any) => acc.email === profile.email);
      
      console.log(`${userExists ? '👤' : '❌'} ${testAccountExists ? '🔑' : '❌'} ${profile.name} (${profile.email})`);
    });
    
    console.log('\nLegend: 👤 = User exists, 🔑 = Test account exists');
    console.groupEnd();
  }
};

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).debugProfileSwitcher = debugProfileSwitcher;
} 