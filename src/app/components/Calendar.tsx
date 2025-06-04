'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addMonths, subMonths, isSameDay } from 'date-fns';
import { mockCanvasApi, CalendarEvent } from '@/lib/mockCanvasApi';
import { Calendar as CalendarIcon, List, Grid } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

type ViewMode = 'month' | 'week' | 'list';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date('2025-06-03')); // Set to June 3, 2025
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Fetch events and courses for the current view
  const fetchData = async () => {
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
        format(endDate, 'yyyy-MM-dd')
      ),
      mockCanvasApi.getCourses()
    ]);
    
    setEvents(fetchedEvents);
    setCourses(fetchedCourses);
  };

  // Fetch events when component mounts or when view mode/date changes
  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode]);

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
    } else if (event.type === 'module') {
      return `/courses/${courseSlug}`;
    }
    
    return `/courses/${courseSlug}`;
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
      const dayEvents = events.filter(event => 
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
                className={`block text-xs p-1 rounded hover:opacity-80 transition-opacity ${
                  event.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'quiz' ? 'bg-purple-100 text-purple-800' :
                  event.type === 'discussion' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {event.title}
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
      const dayEvents = events.filter(event => 
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
                className={`block text-xs p-1 rounded hover:opacity-80 transition-opacity ${
                  event.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'quiz' ? 'bg-purple-100 text-purple-800' :
                  event.type === 'discussion' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-gray-500">{event.course_name}</div>
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
    return (
      <div className="space-y-4">
        {events.map(event => (
          <Link
            key={event.id}
            href={getEventUrl(event)}
            className={`block p-4 rounded-lg hover:opacity-80 transition-opacity ${
              event.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
              event.type === 'quiz' ? 'bg-purple-100 text-purple-800' :
              event.type === 'discussion' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-sm text-gray-500">{event.course_name}</p>
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(event.start_date), 'MMM d, yyyy')}
              </div>
            </div>
            {event.points_possible && (
              <div className="text-sm text-gray-500 mt-2">
                Points: {event.points_possible}
              </div>
            )}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-soft">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={previousPeriod}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-primary-600 transition-colors"
              >
                ←
              </button>
              <button
                onClick={nextPeriod}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-primary-600 transition-colors"
              >
                →
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'list' && renderListView()}
      </div>
    </div>
  );
} 