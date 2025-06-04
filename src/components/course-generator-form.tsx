'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createCourseFromPrompt } from '@/app/actions/courses';
import { useRouter } from 'next/navigation';
import { useAuth, useAPIKey } from '@/contexts/AuthContext';
import { UserService } from '@/lib/userService';

interface CourseGeneratorFormProps {
  onCourseGenerated?: () => void;
}

export function CourseGeneratorForm({ onCourseGenerated }: CourseGeneratorFormProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const apiKey = useAPIKey('gemini');

  const enrollUserInCourse = (courseId: number) => {
    console.log('📝 enrollUserInCourse called with courseId:', courseId);
    console.log('👤 Current user:', user ? { id: user.id, name: user.name } : 'No user');
    
    if (!user) {
      console.log('❌ No user found, cannot enroll');
      return;
    }

    try {
      console.log('📝 Enrolling user in course client-side, course ID:', courseId);
      
      // Get or create user data
      console.log('📂 Getting user data for user ID:', user.id);
      let userData = UserService.getUserData(user.id);
      console.log('📂 User data retrieved:', userData ? 'Found existing data' : 'No data found');
      
      if (!userData) {
        console.log('📝 Creating new user data for enrollment');
        userData = {
          chatHistories: {},
          settings: {
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
          apiKeys: [],
          personalNotes: {},
          bookmarks: [],
          courseProgress: {}
        };
        console.log('📝 Created new user data structure');
      }
      
      // Add course to user's enrollments
      if (!userData.courseProgress) {
        userData.courseProgress = {};
        console.log('📝 Initialized courseProgress object');
      }
      
      console.log('📝 Current enrolled courses before adding:', Object.keys(userData.courseProgress));
      console.log('📝 Detailed enrollments before:', userData.courseProgress);
      
      // Check if already enrolled
      if (userData.courseProgress[courseId.toString()]) {
        console.log('⚠️ User is already enrolled in course', courseId, '- skipping duplicate enrollment');
        return;
      }
      
      userData.courseProgress[courseId.toString()] = {
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
      
      console.log('📝 Added course to courseProgress, new enrolled courses:', Object.keys(userData.courseProgress));
      console.log('📝 Detailed enrollments after:', userData.courseProgress);
      
      console.log('💾 Saving user data to localStorage...');
      UserService.saveUserData(user.id, userData);
      console.log('✅ User enrolled in course client-side, course ID:', courseId);
      console.log('📝 User now enrolled in courses:', Object.keys(userData.courseProgress));
      
      // Verify the data was saved
      const verifyData = UserService.getUserData(user.id);
      console.log('✅ Verification - data saved successfully:', verifyData ? 'YES' : 'NO');
      if (verifyData) {
        console.log('✅ Verification - enrolled courses:', Object.keys(verifyData.courseProgress));
      }
    } catch (error) {
      console.error('❌ Error enrolling user in course:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔑 Client-side API key check for user:', user?.id);
      console.log('🔑 Client-side API key result:', apiKey ? 'FOUND' : 'NOT FOUND');
      console.log('🔑 API key length:', apiKey?.length || 0);

      console.log('📤 Calling server action...');
      const result = await createCourseFromPrompt(prompt, user?.id, apiKey || undefined);
      console.log('📥 Server action result:', result);
      
      if (result.success && result.course) {
        console.log('✅ Course created successfully:', result.course.name);
        console.log('📋 Course details:', { id: result.course.id, name: result.course.name });
        
        setPrompt('');
        
        // Enroll user in the course client-side
        console.log('🔄 Starting client-side enrollment...');
        enrollUserInCourse(result.course.id);
        
        // Call the callback to refresh the courses list
        console.log('🔄 Calling onCourseGenerated callback...');
        if (onCourseGenerated) {
          onCourseGenerated();
        } else {
          console.log('⚠️ No onCourseGenerated callback provided');
        }
        
        // Also trigger Next.js revalidation
        console.log('🔄 Triggering router refresh...');
        router.refresh();
        
        console.log('✅ Course creation and enrollment process completed');
      } else {
        console.error('❌ Course creation failed:', result);
        alert(result.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      alert('An error occurred while creating the course');
    } finally {
      setIsLoading(false);
      console.log('🏁 Course creation process finished, loading state reset');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to create courses.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium mb-2">
          Course Description
        </label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the course you'd like to create. For example:

'Create a web development course covering HTML, CSS, JavaScript, React, and Node.js for beginners'

or

'I need a psychology course about cognitive behavior therapy techniques for undergraduate students'

The AI will generate a complete course structure with modules, assignments, and schedules."
          className="min-h-[200px]"
          required
        />
      </div>
      
      <div className="text-xs text-gray-500">
        {apiKey 
          ? '🤖 Using your Gemini API key for intelligent course generation'
          : '📝 Set your Gemini API key in Settings for AI-powered course generation (will use basic generation)'
        }
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Course...' : 'Create Course with AI'}
      </Button>
    </form>
  );
} 