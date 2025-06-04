'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createCourseFromPrompt } from '@/app/actions/courses';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function CourseGeneratorForm() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createCourseFromPrompt(prompt, user?.id);
      if (result.success) {
        setPrompt('');
        router.refresh();
        // Redirect to the courses page to see the new course
        router.push('/courses');
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Course...' : 'Create Course with AI'}
      </Button>
    </form>
  );
} 