'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createCourseFromPrompt } from '@/app/actions/courses';
import { useRouter } from 'next/navigation';
import { useAuth, useAPIKey } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BookOpen, Clock, Settings, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function CourseGeneratorForm() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const geminiApiKey = useAPIKey('gemini');

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
    <div className="space-y-6">
      {/* AI Enhancement Status */}
      {!geminiApiKey && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Enhance Your Course Creation
            </CardTitle>
            <CardDescription className="text-amber-700">
              Connect your Gemini API key for AI-powered course generation with intelligent parsing and specialized content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">🚀 With API Key You Get:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Intelligent parsing of university catalogs</li>
                  <li>Specialized modules based on course type</li>
                  <li>Comprehensive course structure generation</li>
                  <li>Enhanced assignment and quiz creation</li>
                </ul>
              </div>
              <Link 
                href="/settings" 
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Settings className="h-4 w-4" />
                Add API Key
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Status Indicator */}
      {geminiApiKey && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-5 w-5" />
              AI-Enhanced Course Creation Active
            </CardTitle>
            <CardDescription className="text-green-700">
              Your Gemini API key is connected! You'll get intelligent course parsing and specialized content generation.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {geminiApiKey ? 'AI-Enhanced Course Generator' : 'Course Generator'}
          </CardTitle>
          <CardDescription>
            Create comprehensive courses from any description. 
            {geminiApiKey 
              ? ' AI will intelligently parse and enhance your course content.'
              : ' Basic parsing available - add API key for AI enhancement.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">University Catalog</p>
                <p className="text-gray-600">Paste raw course listings from university catalogs</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Simple Requests</p>
                <p className="text-gray-600">Describe what you want: "Python programming for beginners"</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Auto-Generated</p>
                <p className="text-gray-600">Complete modules, assignments, and schedules</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Course Information
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste any course description or request:

📋 UNIVERSITY CATALOG (e.g., from ASU, MIT, etc.):
Course
Title: Applied Project
Number: LDT 593
Instructor(s): Dr. Smith, Dr. Johnson
Duration: 5/19 - 7/11
Units: 3
Description: Preparation of a supervised applied project...

💭 SIMPLE REQUEST:
'Create a web development course with HTML, CSS, JavaScript, and React'
'I need a psychology course about cognitive behavior therapy'
'Make a data science course for beginners with Python and statistics'

🎓 DETAILED SPECIFICATION:
Name: Advanced Machine Learning
Code: CS485
Instructor: Dr. Martinez
Term: Summer 2025
Description: Deep dive into neural networks, NLP, and computer vision...

The system will automatically parse the information and create a complete course with modules, assignments, quizzes, and discussions!"
            className="min-h-[300px] font-mono text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Tip: The more details you provide, the more accurate and personalized your course will be!
            {!geminiApiKey && (
              <span className="text-amber-600 font-medium">
                {' '}⚡ Add API key in Settings for AI-enhanced parsing!
              </span>
            )}
          </p>
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className={`w-full ${geminiApiKey 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Creating Course...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {geminiApiKey ? 'Create Course with AI' : 'Create Course (Basic)'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
} 