'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addMonths, subMonths, isSameDay } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { mockCanvasApi, CalendarEvent } from '@/lib/mockCanvasApi';
import { Calendar as CalendarIcon, List, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

type ViewMode = 'month' | 'week' | 'list';

export default function Calendar() {
  const { user, getUserData } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date('2025-06-04')); // Set to June 4, 2025
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  // Fetch events and courses for the current view
  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Get user enrollments from their courseProgress keys
    const userData = getUserData();
    const userEnrollments = userData?.courseProgress ? Object.keys(userData.courseProgress) : [];
    
    // Debug logging to understand calendar filtering
    console.log('📅 Calendar Debug Info:');
    console.log('User enrollments:', userEnrollments);
    console.log('User enrollments type:', typeof userEnrollments, userEnrollments?.length);
    
    // Debug current user
    console.log('Current user data:', userData);
    console.log('User session:', user);
    
    let startDate: Date;
    let endDate: Date;

    switch (viewMode) {
      case 'month':
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      case 'week':
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
        break;
      case 'list':
        startDate = new Date();
        endDate = addMonths(startDate, 3); // Show next 3 months
        break;
    }

    const [fetchedEvents, fetchedCourses] = await Promise.all([
      mockCanvasApi.getCalendarEvents(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
        userEnrollments
      ),
      mockCanvasApi.getCourses(userEnrollments)
    ]);
    
    console.log('All events fetched:', fetchedEvents.length);
    console.log('User enrolled courses:', fetchedCourses.map(c => ({ id: c.id, name: c.name })));
    console.log('Events are pre-filtered by API based on enrollments');
    console.log('Event course IDs:', [...new Set(fetchedEvents.map(e => e.course_id))]);
    
    // Events are already filtered by the API based on user enrollments
    setEvents(fetchedEvents);
    setCourses(fetchedCourses);
    setLoading(false);
  };

  // Fetch events when component mounts or when view mode/date changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [currentDate, viewMode, user, getUserData]);

  // Helper function to get the correct URL for an event
  const getEventUrl = (event: CalendarEvent) => {
    const course = courses.find(c => c.id === event.course_id);
    if (!course) return '#';
    
    const courseSlug = slugify(course.name);
    const eventSlug = slugify(event.title);
    
    if (event.type === 'assignment') {
      return `/courses/${courseSlug}/assignments/${eventSlug}`;
    } else if (event.type === 'quiz') {
      return `/courses/${courseSlug}/quizzes/${eventSlug}`;
    } else if (event.type === 'discussion') {
      return `/courses/${courseSlug}/discussions/${eventSlug}`;
    }
    
    return `/courses/${courseSlug}`;
  };

  // Helper function to get event styling
  const getEventStyling = (event: CalendarEvent) => {
    const baseClasses = "block text-xs p-1 rounded hover:opacity-80 transition-opacity";
    
    switch (event.type) {
      case 'assignment':
        return `${baseClasses} bg-blue-100 text-blue-800 border-l-2 border-blue-500`;
      case 'quiz':
        return `${baseClasses} bg-purple-100 text-purple-800 border-l-2 border-purple-500`;
      case 'discussion':
        return `${baseClasses} bg-green-100 text-green-800 border-l-2 border-green-500`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Helper function to get event icon
  const getEventIcon = (event: CalendarEvent) => {
    switch (event.type) {
      case 'assignment': return '';
      case 'quiz': return '';
      case 'discussion': return '';
      default: return '';
    }
  };

  // Navigation handlers
  const previousPeriod = () => {
    setCurrentDate(prev => 
      viewMode === 'month' ? subMonths(prev, 1) : addDays(prev, -7)
    );
  };

  const nextPeriod = () => {
    setCurrentDate(prev => 
      viewMode === 'month' ? addMonths(prev, 1) : addDays(prev, 7)
    );
  };

  // Render helpers
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const dayEvents = filteredEvents.filter(event => 
        isSameDay(new Date(event.start_date), day)
      );

      days.push(
        <div
          key={day.toString()}
          className={`p-2 min-h-[100px] border border-gray-200 ${
            isSameDay(day, new Date()) ? 'bg-blue-50' : 'bg-white'
          }`}
        >
          <div className="text-sm text-gray-500">
            {format(day, 'd')}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <Link
                key={event.id}
                href={getEventUrl(event)}
                className={getEventStyling(event)}
                title={`${event.title} - ${event.course_name}${event.start_time ? ` at ${event.start_time}` : ''}${event.location ? ` (${event.location})` : ''}`}
              >
                <span>{event.title}</span>
                {event.start_time && (
                  <div className="text-xs opacity-75 mt-1">
                    {event.start_time}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      );

      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-gray-500">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = filteredEvents.filter(event => 
        isSameDay(new Date(event.start_date), day)
      );

      days.push(
        <div
          key={day.toString()}
          className={`p-2 min-h-[200px] border border-gray-200 ${
            isSameDay(day, new Date()) ? 'bg-blue-50' : 'bg-white'
          }`}
        >
          <div className="text-sm font-medium text-gray-700">
            {format(day, 'EEE, MMM d')}
          </div>
          <div className="space-y-1 mt-2">
            {dayEvents.map(event => (
              <Link
                key={event.id}
                href={getEventUrl(event)}
                className={getEventStyling(event)}
                title={`${event.title} - ${event.course_name}${event.start_time ? ` at ${event.start_time}` : ''}${event.location ? ` (${event.location})` : ''}`}
              >
                <div className="flex items-center gap-1">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-gray-500 text-xs">{event.course_name}</div>
                  </div>
                  {event.priority === 'high' && <span className="text-red-500 font-bold">!</span>}
                </div>
                {event.start_time && (
                  <div className="text-xs opacity-75 mt-1">
                    {event.start_time}{event.end_time && ` - ${event.end_time}`}
                  </div>
                )}
                {event.location && (
                  <div className="text-xs opacity-75">
                    {event.location}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-50">
        {days}
      </div>
    );
  };

  const renderListView = () => {
    if (filteredEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are no assignments, quizzes, or other events scheduled for the selected time period 
            in your enrolled courses.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredEvents.map(event => (
          <Link
            key={event.id}
            href={getEventUrl(event)}
            className="block p-4 rounded-lg bg-white shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    {event.title}
                    {event.priority === 'high' && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        High Priority
                      </span>
                    )}
                    {event.priority === 'medium' && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Medium Priority
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{event.course_name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {format(new Date(event.start_date), 'MMM d, yyyy')}
                </div>
                {event.start_time && (
                  <div className="text-xs text-gray-400">
                    {event.start_time}{event.end_time && ` - ${event.end_time}`}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
                event.type === 'quiz' ? 'bg-purple-100 text-purple-800' :
                event.type === 'discussion' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.type.replace('_', ' ').toUpperCase()}
              </span>
              
              {event.location && (
                <div className="flex items-center gap-1">
                  <span>{event.location}</span>
                </div>
              )}
              
              {event.points_possible && (
                <div className="flex items-center gap-1">
                  <span>{event.points_possible} pts</span>
                </div>
              )}
            </div>
            
            {event.description && (
              <p className="text-sm text-gray-600 mt-2">{event.description}</p>
            )}
          </Link>
        ))}
      </div>
    );
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filter events based on selected type
  const filteredEvents = eventTypeFilter === 'all' 
    ? events 
    : events.filter(event => event.type === eventTypeFilter);

  const eventTypes = [
    { value: 'all', label: 'All Events', count: events.length },
    { value: 'assignment', label: 'Assignments', count: events.filter(e => e.type === 'assignment').length },
    { value: 'quiz', label: 'Quizzes', count: events.filter(e => e.type === 'quiz').length },
    { value: 'discussion', label: 'Discussions', count: events.filter(e => e.type === 'discussion').length }
  ].filter(type => type.count > 0 || type.value === 'all');

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">
              {format(currentDate, 'MMMM yyyy')} • {filteredEvents.length} events
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Event Type Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="eventFilter" className="text-sm font-medium text-gray-700">
                Filter:
              </label>
              <select
                id="eventFilter"
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.count})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Selector */}
            <div className="flex rounded-lg border border-gray-300 bg-white">
              {[
                { mode: 'month' as const, label: 'Month' },
                { mode: 'week' as const, label: 'Week' },
                { mode: 'list' as const, label: 'List' }
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${mode === 'month' ? 'rounded-l-lg' : mode === 'list' ? 'rounded-r-lg' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={previousPeriod}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextPeriod}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
              {viewMode === 'week' && `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
              {viewMode === 'list' && 'Upcoming Events'}
            </h2>
          </div>
          
          <button
            onClick={() => setCurrentDate(new Date('2025-06-04'))}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'list' && renderListView()}
      </div>
    </div>
  );
} 