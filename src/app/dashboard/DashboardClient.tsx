'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, startOfWeek, addDays, subDays, isSameDay } from 'date-fns';
import { mockCanvasApi, type Assignment } from '@/lib/mockCanvasApi';
import { Book, Calendar, FileText, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(!initialCourses || !initialAssignments);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const { user, getUserData } = useAuth();

  useEffect(() => {
    // Only fetch if no initial data was provided
    if (!initialCourses || !initialAssignments) {
      const fetchData = async () => {
        try {
          // Get user enrollments from their courseProgress keys
          const userData = getUserData();
          const userEnrollments = userData?.courseProgress ? Object.keys(userData.courseProgress) : [];
          
          const [coursesData, allAssignments] = await Promise.all([
            mockCanvasApi.getCourses(userEnrollments),
            mockCanvasApi.getAssignments()
          ]);
          
          // Filter assignments to only include those from user's enrolled courses
          const enrolledCourseIds = coursesData.map(course => course.id);
          const userAssignments = allAssignments.filter(assignment => 
            enrolledCourseIds.includes(assignment.course_id)
          );
          
          setCourses(coursesData);
          setAssignments(userAssignments);
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
  }, [initialCourses, initialAssignments, getUserData]);

  // Load calendar events
  useEffect(() => {
    const loadCalendarEvents = async () => {
      if (user) {
        try {
          const userData = getUserData();
          const userEnrollments = userData?.courseProgress ? Object.keys(userData.courseProgress) : [];
          
          // Get events for the current week and next week
          const startDate = format(currentWeekStart, 'yyyy-MM-dd');
          const endDate = format(addDays(currentWeekStart, 13), 'yyyy-MM-dd'); // 2 weeks
          
          const events = await mockCanvasApi.getCalendarEvents(startDate, endDate, userEnrollments);
          setCalendarEvents(events);
        } catch (error) {
          console.error('Error loading calendar events:', error);
        }
      }
    };

    loadCalendarEvents();
  }, [user, getUserData, currentWeekStart]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Get week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Get upcoming assignments (next 14 days instead of 7 for better visibility)
  const upcomingAssignments = assignments
    .filter(assignment => {
      const dueDate = new Date(assignment.due_at);
      const now = new Date();
      const twoWeeksFromNow = addDays(now, 14);
      return dueDate > now && dueDate <= twoWeeksFromNow;
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

  // Helper function to get event styling
  const getEventStyling = (event: any) => {
    const baseClasses = "block text-xs p-1 rounded hover:opacity-80 transition-opacity";
    
    switch (event.type) {
      case 'assignment':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'quiz':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'discussion':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening in your courses.</p>
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
                {/* Show calendar events for this date */}
                {calendarEvents
                  .filter(event => isSameDay(new Date(event.start_date), date))
                  .map(event => {
                    const course = courses.find(c => c.id === event.course_id);
                    if (!course) return null;
                    
                    const courseSlug = slugify(course.name);
                    const eventSlug = slugify(event.title);
                    
                    let eventUrl = `/courses/${courseSlug}`;
                    if (event.type === 'assignment') {
                      eventUrl = `/courses/${courseSlug}/assignments/${eventSlug}`;
                    } else if (event.type === 'quiz') {
                      eventUrl = `/courses/${courseSlug}/quizzes/${eventSlug}`;
                    } else if (event.type === 'discussion') {
                      eventUrl = `/courses/${courseSlug}/discussions/${eventSlug}`;
                    }
                    
                    return (
                      <Link
                        key={`event-${event.id}`}
                        href={eventUrl}
                        className={getEventStyling(event)}
                        title={`${event.title}${event.start_time ? ` at ${event.start_time}` : ''}${event.location ? ` (${event.location})` : ''}`}
                      >
                        <span className="">{event.title}</span>
                        {event.start_time && (
                          <div className="text-xs opacity-75">
                            {event.start_time}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                
                {/* Show assignments for backward compatibility */}
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
                      <span className="">{assignment.name}</span>
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
                      <div>
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