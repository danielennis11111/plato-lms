'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, startOfWeek, addDays, subDays, isSameDay } from 'date-fns';
import { mockCanvasApi, type Assignment } from '@/lib/mockCanvasApi';
import { Book, Calendar, FileText, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface Course {
  id: number;
  name: string;
  course_code: string;
  modules: any[];
  instructor: string;
  term: string;
}

interface DashboardClientProps {
  courses: Course[];
  assignments: Assignment[];
}

export default function DashboardClient({ courses: initialCourses, assignments: initialAssignments }: DashboardClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses || []);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments || []);
  const [loading, setLoading] = useState(!initialCourses || !initialAssignments);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  useEffect(() => {
    // Only fetch if no initial data was provided
    if (!initialCourses || !initialAssignments) {
      const fetchData = async () => {
        try {
          const [coursesData, assignmentsData] = await Promise.all([
            mockCanvasApi.getCourses(),
            mockCanvasApi.getAssignments()
          ]);
          setCourses(coursesData);
          setAssignments(assignmentsData);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [initialCourses, initialAssignments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Get week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Get upcoming assignments (next 7 days)
  const upcomingAssignments = assignments
    .filter(assignment => {
      const dueDate = new Date(assignment.due_at);
      return dueDate > new Date() && dueDate <= addDays(new Date(), 7);
    })
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

  const getCourseName = (courseId: number) => {
    return courses.find(course => course.id === courseId)?.name || 'Unknown Course';
  };

  const previousWeek = () => {
    setCurrentWeekStart(prev => subDays(prev, 7));
  };

  const nextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">
          You have {assignments.filter(a => a.status === 'not_started').length} upcoming assignments
        </p>
        {courses.length > 0 && courses[0].name.includes('[SAMPLE]') && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              🧪 <strong>Testing Mode:</strong> You're viewing sample courses to explore the platform. 
              Try the AI chat features and course navigation!
            </p>
          </div>
        )}
      </div>

      {/* Week View Calendar */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">This Week</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={previousWeek}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextWeek}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link href="/calendar" className="text-blue-500 hover:text-blue-600">
              View Full Calendar
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`p-4 min-h-[120px] bg-white border border-gray-200 ${
                date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-sm font-medium text-gray-600">
                {format(date, 'EEE')}
              </div>
              <div className="text-lg text-gray-900">
                {format(date, 'd')}
              </div>
              <div className="mt-2 space-y-1">
                {assignments
                  .filter(assignment => {
                    const dueDate = new Date(assignment.due_at);
                    return isSameDay(dueDate, date);
                  })
                  .map(assignment => (
                    <Link
                      key={assignment.id}
                      href={`/courses/${slugify(getCourseName(assignment.course_id))}/assignments/${slugify(assignment.name)}`}
                      className={`block text-xs p-1 rounded hover:opacity-80 transition-opacity ${
                        assignment.name.toLowerCase().includes('quiz') ? 'bg-purple-100 text-purple-800' :
                        assignment.name.toLowerCase().includes('discussion') ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {assignment.name}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/courses/${slugify(course.name)}`}
              className="bg-white rounded-lg p-6 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                  <p className="text-gray-600 mt-1">{course.course_code}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Book className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-600">{course.modules.length} modules</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  {course.instructor}
                </div>
                <div className="text-gray-600">
                  {course.term}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Assignments</h2>
        <div className="space-y-4">
          {upcomingAssignments.slice(0, 5).map(assignment => (
            <Link
              key={assignment.id}
              href={`/courses/${slugify(getCourseName(assignment.course_id))}/assignments/${slugify(assignment.name)}`}
              className="block"
            >
              <div className="bg-white rounded-lg p-6 shadow-sm hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{assignment.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{getCourseName(assignment.course_id)}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due {format(new Date(assignment.due_at), 'MMM d')}
                      </div>
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-1">📝</span>
                        {assignment.points_possible} pts
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    assignment.status === 'not_started' ? 'bg-gray-100 text-gray-800' :
                    assignment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {assignment.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 