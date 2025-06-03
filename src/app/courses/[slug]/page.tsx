'use client';

import { useState, useEffect } from 'react';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { format } from 'date-fns';
import { Book, Calendar, FileText, MessageSquare, Award, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/utils';

interface ModuleItem {
  id: number;
  type: 'assignment' | 'discussion' | 'quiz' | 'page';
  title: string;
  content?: string;
  due_date?: string;
  points_possible?: number;
  status?: 'graded' | 'submitted' | 'not_started' | 'in_progress';
}

interface Module {
  id: number;
  name: string;
  is_completed?: boolean;
  items: ModuleItem[];
}

interface Course {
  id: number;
  name: string;
  description: string;
  syllabus?: string;
  current_grade?: number;
  start_date: string;
  end_date: string;
  total_points: number;
  modules: Module[];
}

interface CoursePageProps {
  params: {
    slug: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleItems, setModuleItems] = useState<Record<number, ModuleItem>>({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const inputSlug = params.slug;
        console.log('Course page - Input slug:', inputSlug);
        
        // Get course by slug
        const courseData = await mockCanvasApi.getCourse(inputSlug);
        console.log('Course page - Received course data:', courseData);
        
        if (courseData) {
          console.log('Course page - Setting course data:', courseData.name);
          setCourse(courseData);
          
          // Fetch all module items
          const items: Record<number, ModuleItem> = {};
          for (const module of courseData.modules) {
            for (const item of module.items) {
              items[item.id] = item;
            }
          }
          setModuleItems(items);
        } else {
          console.error('Course page - Course not found for slug:', inputSlug);
          setError('Course not found');
        }
      } catch (error) {
        console.error('Course page - Error fetching course:', error);
        setError('Error loading course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.slug]);

  const getItemUrl = (item: ModuleItem): string => {
    if (!course) return '#';
    
    const courseSlug = slugify(course.name);
    const itemSlug = slugify(item.title);
    
    switch (item.type) {
      case 'assignment':
        return `/courses/${courseSlug}/assignments/${itemSlug}`;
      case 'discussion':
        return `/courses/${courseSlug}/discussions/${itemSlug}`;
      case 'quiz':
        return `/courses/${courseSlug}/quizzes/${itemSlug}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
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

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
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
      {/* Course Header */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/courses"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Term</span>
            </div>
            <p className="text-gray-900 mt-2">
              {format(new Date(course.start_date), 'MMM d')} - {format(new Date(course.end_date), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Grade</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {course.current_grade ? `${course.current_grade}%` : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Progress</span>
            </div>
            <p className="text-gray-900 mt-2">
              {course.modules.filter(m => m.is_completed).length} / {course.modules.length} Modules
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Book className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Points</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {course.total_points}
            </p>
          </div>
        </div>
      </div>

      {/* Course Modules */}
      <div className="space-y-6">
        {course.modules.map((module) => (
          <div key={module.id} className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{module.name}</h2>
            <div className="space-y-4">
              {module.items.map((item) => (
                <Link
                  key={item.id}
                  href={getItemUrl(item)}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {item.type === 'assignment' && <FileText className="w-5 h-5 text-blue-500" />}
                      {item.type === 'discussion' && <MessageSquare className="w-5 h-5 text-green-500" />}
                      {item.type === 'quiz' && <Award className="w-5 h-5 text-purple-500" />}
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        {item.due_date && (
                          <p className="text-sm text-gray-500">
                            Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.points_possible && (
                      <span className="text-sm font-medium text-gray-600">
                        {item.points_possible} points
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 