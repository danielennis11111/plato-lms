'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/lib/userService';
import { User, ChevronDown } from 'lucide-react';

export default function ProfileSwitcher() {
  const { user, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const profiles = [
    {
      id: 'test_student_1',
      name: 'Alex Chen',
      email: 'student@plato.edu',
      description: 'CS Student with Progress',
      avatar: '👨‍💻'
    },
    {
      id: 'test_student_2',
      name: 'Jordan Smith',
      email: 'newstudent@plato.edu',
      description: 'New Student',
      avatar: '🆕'
    },
    {
      id: 'test_student_3',
      name: 'Taylor Johnson',
      email: 'english.freshman@plato.edu',
      description: 'English Freshman',
      avatar: '📚'
    }
  ];

  const switchProfile = async (profile: typeof profiles[0]) => {
    if (user?.id === profile.id || switching) return;
    
    setSwitching(true);
    setIsOpen(false);
    
    const testAccounts = UserService.getTestAccounts();
    const account = testAccounts.find(acc => acc.email === profile.email);
    
    if (account) {
      await login({ email: account.email, password: account.password });
    }
    
    setSwitching(false);
  };

  const currentProfile = profiles.find(p => p.id === user?.id) || profiles[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors w-full text-left"
        disabled={switching}
      >
        <div className="text-2xl">{currentProfile.avatar}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {currentProfile.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {currentProfile.description}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs text-gray-500 text-center">Switch Student Profile</p>
          </div>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => switchProfile(profile)}
              disabled={switching || user?.id === profile.id}
              className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                user?.id === profile.id ? 'bg-blue-50 text-blue-700' : ''
              } ${switching ? 'opacity-50' : ''} last:rounded-b-lg`}
            >
              <div className="text-2xl">{profile.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile.description}
                </p>
              </div>
              {user?.id === profile.id && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {switching && (
        <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-600">Switching...</span>
          </div>
        </div>
      )}
    </div>
  );
} 