'use client';

import { useState, useEffect } from 'react';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { format } from 'date-fns';
import { ArrowLeft, FileText, Clock, Award } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

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
}

interface Course {
  id: number;
  name: string;
  course_code: string;
}

export default function AssignmentPage({
  params,
}: {
  params: { slug: string; assignmentSlug: string };
}) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get course by slug
        const courseData = await mockCanvasApi.getCourse(params.slug);
        if (!courseData) {
          setError('Course not found');
          return;
        }
        setCourse(courseData);

        // Get assignment by name
        const assignmentData = await mockCanvasApi.getAssignmentByName(
          courseData.id,
          params.assignmentSlug
        );
        
        if (!assignmentData) {
          setError('Assignment not found');
          return;
        }
        
        setAssignment(assignmentData);
      } catch (error) {
        console.error('Error fetching assignment:', error);
        setError('Error loading assignment');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug, params.assignmentSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment || !course) return;

    try {
      // TODO: Implement actual submission logic
      console.log('Submitting assignment:', submission);
      // For now, just update the status
      setAssignment(prev => prev ? { ...prev, status: 'submitted' } : null);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setError('Error submitting assignment');
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
          href={`/courses/${params.slug}`}
          className="text-blue-500 hover:text-blue-600 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Course</span>
        </Link>
      </div>
    );
  }

  if (!assignment || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Assignment not found</h1>
        <Link
          href={`/courses/${params.slug}`}
          className="text-blue-500 hover:text-blue-600 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Course</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Assignment Header */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href={`/courses/${params.slug}`}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{assignment.name}</h1>
        </div>

        {/* Assignment Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Due Date</span>
            </div>
            <p className="text-gray-900 mt-2">
              {format(new Date(assignment.due_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Points</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {assignment.points_possible}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Status</span>
            </div>
            <p className="text-gray-900 mt-2 capitalize">
              {assignment.status.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Assignment Content */}
      <div className="bg-white rounded-lg p-6">
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
          <div className="text-gray-700 whitespace-pre-wrap">{assignment.description}</div>
        </div>

        {/* Submission Form */}
        {assignment.status !== 'graded' && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="submission" className="block text-sm font-medium text-gray-700 mb-2">
                Your Submission
              </label>
              <textarea
                id="submission"
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Enter your submission here..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Assignment
            </button>
          </form>
        )}

        {/* Feedback (if graded) */}
        {assignment.status === 'graded' && assignment.feedback && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
            <p className="text-gray-700">{assignment.feedback}</p>
            {assignment.grade !== undefined && (
              <p className="mt-2 text-lg font-medium text-gray-900">
                Grade: {assignment.grade} / {assignment.points_possible}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 