'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockCanvasApi, type Course, type Assignment } from '@/lib/mockCanvasApi';
import DashboardClient from './dashboard/DashboardClient';

export default function Home() {
  const { user, getUserData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user enrollments from their courseProgress keys
        const userData = getUserData();
        const userEnrollments = userData?.courseProgress ? Object.keys(userData.courseProgress) : [];
        
        const [coursesData, allAssignments] = await Promise.all([
          mockCanvasApi.getCourses(userEnrollments),
          mockCanvasApi.getAssignments(),
        ]);

        // Filter assignments to only include those from user's enrolled courses
        const enrolledCourseIds = coursesData.map(course => course.id);
        const userAssignments = allAssignments.filter(assignment => 
          enrolledCourseIds.includes(assignment.course_id)
        );

        setCourses(coursesData);
        setAssignments(userAssignments);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, getUserData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Error Loading Dashboard</h2>
        <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  return <DashboardClient courses={courses} assignments={assignments} />;
}
