// Debug utilities for development
import { UserService } from './userService';

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
      { email: 'english.freshman@plato.edu', password: 'EnglishFresh123!' }
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
  }
};

// Make it available globally in development
if (typeof window !== 'undefined') {
  (window as any).debugUtils = debugUtils;
} 