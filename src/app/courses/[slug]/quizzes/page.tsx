'use client';

import { useState, useEffect } from 'react';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { slugify } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, HelpCircle, Clock, Award } from 'lucide-react';

interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string;
  course_id: number;
  points_possible: number;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  submissions?: number;
  attempts?: number;
  max_attempts?: number;
  quiz_details?: {
    time_limit: number;
    allowed_attempts: number;
    questions: any[];
  };
}

interface Course {
  id: number;
  name: string;
  course_code: string;
  instructor: string;
}

interface QuizzesPageProps {
  params: {
    slug: string;
  };
}

export default function QuizzesPage({ params }: QuizzesPageProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await mockCanvasApi.getCourse(params.slug);
        
        if (courseData) {
          setCourse(courseData);
          
          // Get assignments for this course and filter for quizzes
          const assignmentsData = await mockCanvasApi.getAssignments([courseData.id]);
          const quizData = assignmentsData.filter(assignment => 
            assignment.name.toLowerCase().includes('quiz') || 
            assignment.quiz_details ||
            assignment.submission_type === 'online_quiz'
          );
          setQuizzes(quizData);
        } else {
          setError('Course not found');
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setError('Error loading quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Course not found'}</h1>
        <Link
          href="/courses"
          className="text-blue-500 hover:text-blue-600 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Courses</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href={`/courses/${params.slug}`}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
            <p className="text-gray-600 text-sm">{course.course_code} • {course.instructor}</p>
          </div>
        </div>
        <p className="text-gray-600">View and take all quizzes for {course.name}</p>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-600">Quizzes will appear here as they're added to the course.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/courses/${params.slug}/quizzes/${slugify(quiz.name)}`}
              className="block"
            >
              <div className="bg-white rounded-lg p-6 shadow-sm hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        <HelpCircle className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{quiz.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due {format(new Date(quiz.due_at), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <Award className="w-4 h-4 mr-1" />
                            {quiz.points_possible} points
                          </div>
                          {quiz.quiz_details?.time_limit && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {quiz.quiz_details.time_limit} min
                            </div>
                          )}
                          {quiz.quiz_details?.allowed_attempts && (
                            <div className="flex items-center">
                              <span>{quiz.quiz_details.allowed_attempts} attempts allowed</span>
                            </div>
                          )}
                          {quiz.grade !== undefined && (
                            <div className="flex items-center">
                              <span>Grade: {quiz.grade}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(quiz.status)}`}>
                      {quiz.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
} 