// Debug utilities for development
import { UserService } from './userService';
import { debugProfileSwitcher } from './debugProfileSwitcher';

export const debugUtils = {
  clearAllData() {
    console.log('🧹 Clearing all localStorage data...');
    localStorage.removeItem('plato_users');
    localStorage.removeItem('plato_current_session');
    localStorage.removeItem('plato_user_data');
    localStorage.removeItem('geminiApiKey');
    localStorage.removeItem('openaiApiKey');
    localStorage.removeItem('anthropicApiKey');
    console.log('✅ All data cleared');
    // Reinitialize after clearing
    UserService.initializeTestAccounts();
  },

  inspectStorage() {
    console.log('🔍 Inspecting localStorage:');
    const users = localStorage.getItem('plato_users');
    const session = localStorage.getItem('plato_current_session');
    const userData = localStorage.getItem('plato_user_data');
    
    console.log('Users:', users ? JSON.parse(users) : 'No users found');
    console.log('Session:', session ? JSON.parse(session) : 'No session found');
    console.log('User Data:', userData ? JSON.parse(userData) : 'No user data found');
    
    return {
      users: users ? JSON.parse(users) : null,
      session: session ? JSON.parse(session) : null,
      userData: userData ? JSON.parse(userData) : null
    };
  },

  reinitializeTestAccounts() {
    console.log('🔄 Re-initializing test accounts...');
    UserService.initializeTestAccounts();
    console.log('✅ Test accounts re-initialized');
  },

  forceResetTestAccounts() {
    console.log('🔥 Force resetting all test accounts...');
    // Clear users but keep other data
    localStorage.removeItem('plato_users');
    localStorage.removeItem('plato_current_session');
    UserService.initializeTestAccounts();
    console.log('✅ Test accounts force reset completed');
  },

  verifyTestPasswords() {
    console.log('🔐 Verifying test account passwords...');
    const users = localStorage.getItem('plato_users');
    if (!users) {
      console.log('❌ No users found in storage');
      return;
    }

    const testCredentials = [
      { email: 'student@plato.edu', password: 'Student123!' },
      { email: 'newstudent@plato.edu', password: 'NewStudent123!' },
      { email: 'english.freshman@plato.edu', password: 'EnglishFresh123!' },
      { email: 'faculty@plato.edu', password: 'Faculty123!' },
      { email: 'jennifer.werner.2@asu.edu', password: 'Faculty123!' },
      { email: 'sarah.jarboe@asu.edu', password: 'Staff123!' },
      { email: 'bshettah@asu.edu', password: 'Faculty123!' }
    ];

    const parsedUsers = JSON.parse(users);
    testCredentials.forEach(cred => {
      const user = parsedUsers.find((u: any) => u.email === cred.email);
      if (user) {
        const expectedHash = btoa(cred.password + 'salt_2025');
        const actualHash = user.passwordHash;
        const matches = expectedHash === actualHash;
        console.log(`${matches ? '✅' : '❌'} ${cred.email}: ${matches ? 'Password OK' : 'Password MISMATCH'}`);
        if (!matches) {
          console.log(`  Expected: ${expectedHash}`);
          console.log(`  Actual:   ${actualHash}`);
        }
      } else {
        console.log(`❌ ${cred.email}: User not found`);
      }
    });
  },

  async testLogin(email = 'student@plato.edu', password = 'Student123!') {
    console.log(`🧪 Testing login with ${email}...`);
    try {
      const result = await UserService.login({ email, password });
      console.log('Login result:', result);
      if (result.success) {
        console.log('✅ Test login successful!');
      } else {
        console.log('❌ Test login failed:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Login test error:', error);
      return { success: false, error: 'Test failed' };
    }
  },

  getTestAccounts() {
    const accounts = UserService.getTestAccounts();
    console.log('📋 Available test accounts:');
    accounts.forEach(account => {
      console.log(`  - ${account.email} (${account.description})`);
    });
    return accounts;
  },

  diagnoseLoginIssues() {
    console.log('🩺 Diagnosing login issues...');
    
    const storage = this.inspectStorage();
    const testAccounts = this.getTestAccounts();
    
    console.log('📊 Diagnosis:');
    console.log('- Test accounts defined:', testAccounts.length > 0 ? '✅' : '❌');
    console.log('- Users in storage:', storage.users ? `✅ (${storage.users.length} users)` : '❌');
    console.log('- Current session:', storage.session ? '✅' : '❌');
    
    if (!storage.users || storage.users.length === 0) {
      console.log('🔧 Fix: Run debugUtils.reinitializeTestAccounts()');
    } else {
      console.log('🔧 Checking password hashes...');
      this.verifyTestPasswords();
      console.log('🔧 If passwords are mismatched, run debugUtils.forceResetTestAccounts()');
    }
    
    return {
      hasTestAccounts: testAccounts.length > 0,
      hasUsers: storage.users && storage.users.length > 0,
      hasSession: !!storage.session,
      userCount: storage.users ? storage.users.length : 0
    };
  },

  // Check what test accounts exist
  checkTestAccounts() {
    console.group('🔍 Test Accounts Debug');
    
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('plato_users') || '[]');
    console.log('📊 Total users in storage:', users.length);
    
    // Log each user
    users.forEach((user: any) => {
      console.log(`👤 ${user.id}: ${user.email} (${user.name})`);
    });
    
    // Check test accounts
    const { UserService } = require('./userService');
    const testAccounts = UserService.getTestAccounts();
    console.log('📋 Test accounts from service:', testAccounts.length);
    
    testAccounts.forEach((account: any) => {
      const userExists = users.find((u: any) => u.email === account.email);
      console.log(`${userExists ? '✅' : '❌'} ${account.email} - ${account.description}`);
    });
    
    console.groupEnd();
  },

  // Force refresh test accounts
  refreshAccounts() {
    console.log('🔄 Refreshing test accounts...');
    const { UserService } = require('./userService');
    UserService.refreshTestAccounts();
    this.checkTestAccounts();
  },

  // Check current session
  checkSession() {
    console.group('🔍 Session Debug');
    const session = JSON.parse(localStorage.getItem('plato_current_session') || 'null');
    if (session) {
      console.log('✅ Active session:', session.user.email);
      console.log('📅 Expires:', new Date(session.expiresAt));
    } else {
      console.log('❌ No active session');
    }
    console.groupEnd();
  },

  // Check profile switcher compatibility
  checkProfileSwitcher() {
    console.group('🔍 Profile Switcher Debug');
    
    const profileEmails = [
      'student@plato.edu',
      'newstudent@plato.edu', 
      'english.freshman@plato.edu',
      'alex.cs@plato.edu',
      'maria.eng@plato.edu',
      'james.bio@plato.edu',
      'priya.ml@plato.edu',
      'faculty@plato.edu',
      'y.chen@plato.edu',
      'bshettah@asu.edu',
      'k.jaskie@plato.edu',
      'r.green@plato.edu',
      'd.kumar@plato.edu',
      'jennifer.werner.2@asu.edu',
      'sarah.jarboe@asu.edu',
      'ezinwanne.ikediuwa@asu.edu'
    ];

    const users = JSON.parse(localStorage.getItem('plato_users') || '[]');
    const { UserService } = require('./userService');
    const testAccounts = UserService.getTestAccounts();

    profileEmails.forEach(email => {
      const userExists = users.find((u: any) => u.email === email);
      const testAccountExists = testAccounts.find((a: any) => a.email === email);
      
      console.log(`${userExists ? '👤' : '❌'} ${testAccountExists ? '🔑' : '❌'} ${email}`);
    });
    
    console.log('\nLegend: 👤 = User exists, 🔑 = Test account exists');
    console.groupEnd();
  },

  // Specific check for Jennifer Werner and Sarah Jarboe
  checkProblematicProfiles() {
    console.group('🔍 Checking Jennifer Werner & Sarah Jarboe');
    
    const users = JSON.parse(localStorage.getItem('plato_users') || '[]');
    const { UserService } = require('./userService');
    const testAccounts = UserService.getTestAccounts();
    
    const problemEmails = ['jennifer.werner.2@asu.edu', 'sarah.jarboe@asu.edu'];
    
    problemEmails.forEach(email => {
      console.log(`\n🔍 Checking ${email}:`);
      
      const user = users.find((u: any) => u.email === email);
      const testAccount = testAccounts.find((acc: any) => acc.email === email);
      
      console.log('  📊 User in storage:', user ? '✅ EXISTS' : '❌ MISSING');
      if (user) {
        console.log('    - ID:', user.id);
        console.log('    - Name:', user.name);
        console.log('    - Password Hash:', user.passwordHash?.substring(0, 10) + '...');
      }
      
      console.log('  📋 Test account config:', testAccount ? '✅ EXISTS' : '❌ MISSING');
      if (testAccount) {
        console.log('    - Password:', testAccount.password);
        console.log('    - Description:', testAccount.description);
      }
      
      // Show password hash analysis
      if (user && testAccount) {
        const expectedHash = btoa(testAccount.password + 'salt_2025');
        const actualHash = user.passwordHash;
        const matches = expectedHash === actualHash;
        console.log(`  🔐 Password match: ${matches ? '✅ GOOD' : '❌ MISMATCH'}`);
        if (!matches) {
          console.log(`    Expected: ${expectedHash}`);
          console.log(`    Actual:   ${actualHash}`);
        }
      }
    });
    
    console.log('\n🔧 If accounts are missing or password mismatched:');
    console.log('    Run: debugUtils.forceResetTestAccounts()');
    console.groupEnd();
  }
};

// Make it available globally in development
if (typeof window !== 'undefined') {
  (window as any).debugUtils = debugUtils;
} 