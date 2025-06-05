'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/lib/userService';
import { getASUPhotoUrl } from '@/lib/mockCanvasApi';
import { User, ChevronDown } from 'lucide-react';

export default function ProfileSwitcher() {
  const { user, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const profiles = [
    // Original Student Profiles
    {
      id: 'test_student_1',
      name: 'Alex Chen',
      email: 'student@plato.edu',
      description: 'CS Student with Progress',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    {
      id: 'test_student_2',
      name: 'Jordan Smith',
      email: 'newstudent@plato.edu',
      description: 'New Student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    {
      id: 'test_student_3',
      name: 'Taylor Johnson',
      email: 'english.freshman@plato.edu',
      description: 'English Freshman - Literature & Creative Writing',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    
    // New Diverse Student Profiles
    {
      id: 'student_cs_sophomore',
      name: 'Jordan Rivera',
      email: 'jordan.rivera@plato.edu',
      description: 'CS Sophomore - Software Dev & UX',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    {
      id: 'student_engineering_junior',
      name: 'Maria Rodriguez',
      email: 'maria.eng@plato.edu', 
      description: 'Mechanical Engineering Junior',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    {
      id: 'student_bio_senior',
      name: 'James Williams',
      email: 'james.bio@plato.edu',
      description: 'Biology Senior - Environmental Focus',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    {
      id: 'student_ml_grad',
      name: 'Priya Patel',
      email: 'priya.ml@plato.edu',
      description: 'Graduate Student - Healthcare AI',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    {
      id: 'student_physics_sophomore',
      name: 'David Kim',
      email: 'david.physics@plato.edu',
      description: 'Physics Sophomore - Quantum Computing',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    {
      id: 'student_art_junior',
      name: 'Sophie Chen',
      email: 'sophie.art@plato.edu',
      description: 'Digital Arts Junior - Game Design',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    {
      id: 'student_business_senior',
      name: 'Marcus Johnson',
      email: 'marcus.biz@plato.edu',
      description: 'Business Senior - Entrepreneurship',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },
    {
      id: 'student_psych_junior',
      name: 'Aisha Patel',
      email: 'aisha.psych@plato.edu',
      description: 'Psychology Junior - Cognitive Science',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=40&h=40&fit=crop&crop=face',
      category: 'Students'
    },

    // Original Faculty Profile  
    {
      id: 'test_faculty_1',
      name: 'Dr. Sarah Martinez',
      email: 'faculty@plato.edu',
      description: 'CS Professor - Web Dev & Philosophy',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      category: 'Faculty'
    },
    
    // New ASU-Inspired Faculty Profiles
    {
      id: 'faculty_chen',
      name: 'Dr. Yinong Chen',
      email: 'y.chen@plato.edu',
      description: 'Teaching Professor - Distributed Systems',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      category: 'Faculty'
    },
    {
      id: 'faculty_chakravarthi',
      name: 'Dr. Bharatesh Chakravarthi',
      email: 'bshettah@asu.edu',
      description: 'HCI Assistant Teaching Professor - VR & AI Research',
      avatar: getASUPhotoUrl('bshettah'),
      category: 'Faculty'
    },
    {
      id: 'faculty_jaskie',
      name: 'Dr. Kristen Jaskie',
      email: 'k.jaskie@plato.edu',
      description: 'Machine Learning Professor',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      category: 'Faculty'
    },
    {
      id: 'faculty_green',
      name: 'Dr. Rachel Green',
      email: 'r.green@plato.edu',
      description: 'Environmental Science Professor',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      category: 'Faculty'
    },
    {
      id: 'faculty_kumar',
      name: 'Prof. David Kumar',
      email: 'd.kumar@plato.edu',
      description: 'Engineering Design Professor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      category: 'Faculty'
    },

    // Real ASU Faculty - Jennifer Werner
    {
      id: 'faculty_werner',
      name: 'Jennifer Werner',
      email: 'jennifer.werner.2@asu.edu',
      description: 'AI Learning Strategist - Technology Literacy',
      avatar: getASUPhotoUrl('jwerner9'),
      category: 'Faculty'
    },

    // Real ASU Instructional Designer - Sarah Jarboe
    {
      id: 'test_designer_1',
      name: 'Sarah Jarboe',
      email: 'sarah.jarboe@asu.edu',
      description: 'Instructional Designer - Learning Enterprise',
      avatar: getASUPhotoUrl('sjarboe'),
      category: 'Staff'
    },

    // Graduate Teaching Assistant - Ezinwanne Ikediuwa
    {
      id: 'graduate_ta_ikediuwa',
      name: 'Ezinwanne Ikediuwa',
      email: 'ezinwanne.ikediuwa@asu.edu',
      description: 'Graduate TA - Chemistry PhD (Electrochemistry)',
      avatar: getASUPhotoUrl('ezinwanne.ikediuwa'),
      category: 'Students'
    },

    // Real ASU Chinese Language Instructor - Fangzhou Shi
    {
      id: 'faculty_shi',
      name: 'Fangzhou Shi',
      email: 'fangzh10@asu.edu',
      description: 'Chinese Language Instructor - Comparative Culture & Language PhD',
      avatar: 'https://webapp4.asu.edu/photo-ws/directory_photo/fangzh10?size=medium&break=1749083549&blankImage2=1',
      category: 'Faculty'
    }
  ];

  const switchProfile = async (profile: typeof profiles[0]) => {
    if (user?.id === profile.id || switching) return;
    
    console.log(`🔄 Attempting to switch to profile: ${profile.name} (${profile.email})`);
    setSwitching(true);
    setIsOpen(false);
    
    try {
      // First try to login with test account credentials if available
      const testAccounts = UserService.getTestAccounts();
      const account = testAccounts.find(acc => acc.email === profile.email);
      
      console.log(`🔍 Test account found for ${profile.email}:`, !!account);
      
      if (account) {
        console.log(`🔐 Attempting login with credentials for ${profile.email}`);
        const result = await login({ email: account.email, password: account.password });
        console.log(`✅ Login result:`, result);
        
        // If login failed, fall back to demo session
        if (!result.success) {
          console.log(`🎭 Login failed, creating demo session instead for: ${profile.name}`);
          // Fall through to demo session creation
        } else {
          // Login successful, we're done
          setSwitching(false);
          return;
        }
      }
      
      // Create demo session (either no account found OR login failed)
      console.log(`🎭 Creating demo session for: ${profile.name} (${profile.email})`);
      
      // Create a basic user session for this profile
      const demoUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        profile: {
          firstName: profile.name.split(' ')[0],
          lastName: profile.name.split(' ').slice(1).join(' '),
          bio: profile.description,
          avatar: profile.avatar.startsWith('http') ? profile.avatar : '',
          learningGoals: ['Demo profile for testing'],
          academicLevel: profile.category === 'Students' ? 'undergraduate' : 'professional',
          subjectInterests: [],
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
      
      // Create a demo session (matching UserService session format)
      const demoSession = {
        user: demoUser,
        token: `demo_${profile.id}_${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        isAuthenticated: true // This is the missing property!
      };
      
      console.log(`💾 Saving demo session to localStorage:`, demoSession);
      
      // Save session directly to localStorage
      localStorage.setItem('plato_current_session', JSON.stringify(demoSession));
      
      console.log(`🔄 Triggering page reload to apply session change...`);
      
      // Trigger a page reload to apply the session change
      window.location.reload();
    } catch (error) {
      console.error('❌ Failed to switch profile:', error);
      console.error('Error details:', error);
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
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {currentProfile.avatar.startsWith('http') ? (
            <img 
              src={currentProfile.avatar} 
              alt={currentProfile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">
              {currentProfile.avatar}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 ">
            {currentProfile.name}
          </p>
          <p className="text-xs text-gray-500 ">
            {currentProfile.description}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs text-gray-500 text-center">Switch Profile</p>
          </div>
          
          {/* Group profiles by category */}
          {['Students', 'Faculty', 'Staff'].map(category => {
            const categoryProfiles = profiles.filter(p => p.category === category);
            if (categoryProfiles.length === 0) return null;
            
            return (
              <div key={category}>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-700">{category}</p>
                </div>
                {categoryProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => switchProfile(profile)}
                    disabled={switching || user?.id === profile.id}
                    className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                      user?.id === profile.id ? 'bg-blue-50 text-blue-700' : ''
                    } ${switching ? 'opacity-50' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {profile.avatar.startsWith('http') ? (
                        <img 
                          src={profile.avatar} 
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          {profile.avatar}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {profile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {profile.description}
                      </p>
                    </div>
                    {user?.id === profile.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
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