'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { BookOpen, ClipboardList, LayoutDashboard } from 'lucide-react';

interface Course {
  id: number;
  name: string;
}

interface Assignment {
  id: number;
  name: string;
  course_id: number;
}

export default function NewChatPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, assignmentsData] = await Promise.all([
          mockCanvasApi.getCourses(),
          mockCanvasApi.getAssignments()
        ]);
        setCourses(coursesData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const startNewChat = (type: 'course' | 'assignment' | 'dashboard', id?: number, title?: string) => {
    const contextKey = id ? `${type}-${id}` : 'dashboard';
    router.push(`/chat/${contextKey}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Start New Chat</h1>

      <div className="grid gap-6">
        {/* Dashboard Chat */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LayoutDashboard className="w-5 h-5 mr-2" />
            General Assistant
          </h2>
          <p className="text-gray-600 mb-4">
            Chat with the AI assistant about your overall learning progress, schedule, and general questions.
          </p>
          <button
            onClick={() => startNewChat('dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Chat
          </button>
        </div>

        {/* Course Chats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Course-Specific Chats
          </h2>
          <div className="grid gap-4">
            {courses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{course.name}</h3>
                <button
                  onClick={() => startNewChat('course', course.id, course.name)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Start Course Chat
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Chats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Assignment-Specific Chats
          </h2>
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{assignment.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Course: {courses.find(c => c.id === assignment.course_id)?.name}
                </p>
                <button
                  onClick={() => startNewChat('assignment', assignment.id, assignment.name)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Start Assignment Chat
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 