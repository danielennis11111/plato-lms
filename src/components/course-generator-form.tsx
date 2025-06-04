'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createCourseFromPrompt } from '@/app/actions/courses';
import { useRouter } from 'next/navigation';
import { useAuth, useAPIKey } from '@/contexts/AuthContext';

interface CourseGeneratorFormProps {
  onCourseGenerated?: () => void;
}

export function CourseGeneratorForm({ onCourseGenerated }: CourseGeneratorFormProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const apiKey = useAPIKey('gemini');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔑 Client-side API key check for user:', user?.id);
      console.log('🔑 Client-side API key result:', apiKey ? 'FOUND' : 'NOT FOUND');
      console.log('🔑 API key length:', apiKey?.length || 0);

      const result = await createCourseFromPrompt(prompt, user?.id, apiKey || undefined);
      if (result.success) {
        setPrompt('');
        console.log('✅ Course created successfully:', result.course?.name);
        
        // Call the callback to refresh the courses list
        if (onCourseGenerated) {
          onCourseGenerated();
        }
        
        // Also trigger Next.js revalidation
        router.refresh();
      } else {
        alert(result.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating the course');
    } finally {
      setIsLoading(false);
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