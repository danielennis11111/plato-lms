'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockCanvasApi, type Course } from '@/lib/mockCanvasApi';
import { CourseCard } from '@/components/course-card';
import { CourseGeneratorForm } from '@/components/course-generator-form';

export default function CoursesPage() {
  const { user, getUserData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Get user enrollments from their courseProgress keys
        const userData = getUserData();
        const userEnrollments = userData?.courseProgress ? Object.keys(userData.courseProgress) : [];
        
        const coursesData = await mockCanvasApi.getCourses(userEnrollments);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error loading courses:', error);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, getUserData]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Error Loading Courses</h2>
          <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Your Courses</h1>
        
        {courses.length > 0 && courses[0].name.includes('[SAMPLE]') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Sample Courses for Testing</h3>
            <p className="text-blue-700">
              You're seeing sample courses to test the platform. These include assignments and AI chat functionality. 
              Create your own courses below or enroll in actual courses to see your personalized content.
            </p>
          </div>
        )}
        
        {courses.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">No Enrolled Courses</h3>
            <p className="text-yellow-700">
              You are not currently enrolled in any courses. Create a new course below to get started!
            </p>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
          <CourseGeneratorForm />
        </div>
      </div>
      
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
} 