'use client';

import { useState } from 'react';
import { mockCanvasApi, type Course } from '@/lib/mockCanvasApi';
import { createCourseFromPrompt } from '@/app/actions/courses';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/lib/userService';

interface CourseGeneratorProps {
  onCourseGenerated: () => void;
}

export default function CourseGenerator({ onCourseGenerated }: CourseGeneratorProps) {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const generateCourse = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      if (!user) {
        setError('Please sign in to create courses.');
        return;
      }

      // Use the new server action that integrates with Gemini API
      const result = await createCourseFromPrompt(input, user.id);
      
      if (result.success) {
        // Clear input and notify parent
        setInput('');
        onCourseGenerated();
      } else {
        setError(result.error || 'Failed to generate course. Please try again.');
      }
    } catch (err) {
      setError('Failed to generate course. Please try again.');
      console.error('Error generating course:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Generate New Course</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Please sign in to create courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Generate New Course</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="courseInput" className="block text-sm font-medium text-gray-700 mb-2">
            Describe the course you'd like to create
          </label>
          <textarea
            id="courseInput"
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Describe your course idea. For example:

'Create a beginner-friendly web development course covering HTML, CSS, JavaScript, React, and Node.js'

'I need a psychology course about cognitive behavioral therapy for undergraduate students'

The AI will generate a complete course with modules, assignments, quizzes, and schedules."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>
        )}
        
        <button
          onClick={generateCourse}
          disabled={isGenerating || !input.trim()}
          className={`w-full px-4 py-2 rounded-md text-white font-medium
            ${isGenerating || !input.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
            }`}
        >
          {isGenerating ? 'Generating Course with AI...' : 'Generate Course with AI'}
        </button>
        
        {user && (
          <div className="text-xs text-gray-500 mt-2">
            {UserService.getActiveAPIKey(user.id, 'gemini') 
              ? '🤖 Using your Gemini API key for intelligent course generation'
              : '📝 Set your Gemini API key in Settings for AI-powered course generation'
            }
          </div>
        )}
      </div>
    </div>
  );
} 