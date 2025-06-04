'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/lib/userService';
import { debugUtils } from '@/lib/debugUtils';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const testAccounts = [
    {
      email: 'student@plato.edu',
      password: 'Student123!',
      name: 'Alex Chen',
      description: 'Experienced student with courses and progress'
    },
    {
      email: 'newstudent@plato.edu', 
      password: 'NewStudent123!',
      name: 'Jordan Smith',
      description: 'New student with blank slate for course creation'
    },
    {
      email: 'english.freshman@plato.edu',
      password: 'EnglishFresh123!',
      name: 'Taylor Johnson',
      description: 'English freshman with Literature & Composition courses'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await attemptLogin(email, password);
  };

  const attemptLogin = async (emailToUse: string, passwordToUse: string) => {
    setError('');
    setIsSubmitting(true);

    if (!emailToUse || !passwordToUse) {
      setError('Please enter both email and password');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🔐 Attempting login with:', emailToUse);
      const result = await login({ email: emailToUse, password: passwordToUse });
      
      if (result.success) {
        console.log('✅ Login successful, redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        console.log('❌ Login failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('🚨 Login error:', err);
      setError('An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestAccountLogin = async (account: typeof testAccounts[0]) => {
    console.log('🧪 Test account login for:', account.email);
    await attemptLogin(account.email, account.password);
  };

  const handleDebugTools = () => {
    console.log('🔧 Debug Tools:');
    console.log('Test Accounts:', debugUtils.getTestAccounts());
    debugUtils.inspectStorage();
    
    // Reinitialize test accounts if needed
    debugUtils.reinitializeTestAccounts();
  };

  const handleDiagnoseIssues = () => {
    debugUtils.diagnoseLoginIssues();
  };

  const handleForceReset = () => {
    console.log('🔥 Force resetting test accounts...');
    debugUtils.forceResetTestAccounts();
    setError('');
    // Refresh the page to re-initialize everything
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Welcome back to Plato LMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium">Login Error</h3>
                <div className="mt-2 text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Test Accounts Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Demo & Testing</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowTestAccounts(!showTestAccounts)}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {showTestAccounts ? 'Hide Test Accounts' : 'Show Test Accounts'}
            </button>
          </div>

          {showTestAccounts && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-gray-600 text-center">
                Click any account below to log in instantly
              </p>
              {testAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleTestAccountLogin(account)}
                  disabled={isSubmitting}
                  className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium text-blue-900">{account.name}</div>
                  <div className="text-sm text-blue-700">{account.email}</div>
                  <div className="text-xs text-blue-600 mt-1">{account.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Debug Tools (Development Only) */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={handleDebugTools}
            className="w-full text-xs text-gray-500 hover:text-gray-700 py-2"
          >
            🔧 Debug Tools (Check Console)
          </button>
          
          <button
            type="button"
            onClick={handleDiagnoseIssues}
            className="w-full text-xs text-blue-600 hover:text-blue-800 py-1"
          >
            🩺 Diagnose Login Issues
          </button>
          
          <button
            type="button"
            onClick={handleForceReset}
            className="w-full text-xs text-red-600 hover:text-red-800 py-1"
          >
            🔥 Force Reset Test Accounts
          </button>
        </div>

        <div className="text-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
} 