'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockCanvasApi, type Assignment, type Course } from '@/lib/mockCanvasApi';
import DashboardClient from './DashboardClient';

export default function Dashboard() {
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
        
        const [coursesData, assignmentsData] = await Promise.all([
          mockCanvasApi.getCourses(userEnrollments),
          mockCanvasApi.getAssignments()
        ]);

        setCourses(coursesData);
        // Filter assignments to only those from enrolled courses
        const filteredAssignments = assignmentsData.filter(assignment => 
          coursesData.some(course => course.id === assignment.course_id)
        );
        setAssignments(filteredAssignments);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Error Loading Dashboard</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return <DashboardClient courses={courses} assignments={assignments} />;
} 