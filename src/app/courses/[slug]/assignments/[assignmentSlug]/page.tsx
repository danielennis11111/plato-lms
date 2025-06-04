'use client';

import { useState, useEffect } from 'react';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { AIGradingService } from '@/lib/aiGradingService';
import { format } from 'date-fns';
import { ArrowLeft, FileText, Clock, Award, Brain, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { AssignmentSubmissionForm } from '@/components/AssignmentSubmissionForm';

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

interface GradingResult {
  score: number;
  breakdown: {
    criterion: string;
    score: number;
    feedback: string;
  }[];
  overallFeedback: string;
  suggestions: string[];
  passesThreshold: boolean;
}

export default function AssignmentPage({
  params,
}: {
  params: { slug: string; assignmentSlug: string };
}) {
  const { getUserData } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState('');
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmissionChange = (newSubmission: string) => {
    setSubmission(newSubmission);
  };

  const handlePreGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment || !course || !submission.trim()) return;

    setIsGrading(true);
    setGradingResult(null);
    
    try {
      // Get user's API key for enhanced grading
      const userData = getUserData();
      const geminiKey = userData?.apiKeys?.find(key => key.provider === 'gemini' && key.isActive)?.keyHash;
      
      let result: GradingResult;
      if (geminiKey) {
        result = await AIGradingService.gradeWithAI(submission, assignment, geminiKey);
      } else {
        result = await AIGradingService.gradeSubmission(submission, assignment);
      }
      
      setGradingResult(result);
    } catch (error) {
      console.error('Error grading submission:', error);
      setError('Error analyzing submission. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!assignment || !course) return;

    setIsSubmitting(true);
    
    try {
      // Convert percentage to points
      const earnedPoints = gradingResult ? Math.round((gradingResult.score / 100) * assignment.points_possible) : 0;
      
      // Submit assignment with grade and feedback
      const updatedAssignment = await mockCanvasApi.submitAssignment(
        assignment.id,
        submission,
        earnedPoints,
        gradingResult?.overallFeedback || 'Assignment submitted successfully.'
      );
      
      setAssignment(updatedAssignment);
      
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setError('Error submitting assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !assignment || !course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
        <p className="mt-2 text-gray-600">{error || 'Assignment not found'}</p>
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

        {/* Enhanced Submission Form with Dictation */}
        {assignment.status !== 'graded' && (
          <div className="mt-8">
            <AssignmentSubmissionForm
              initialValue={submission}
              onSubmissionChange={handleSubmissionChange}
              onSubmit={handlePreGrade}
              isSubmitting={isGrading}
              placeholder="Enter your submission here. You can type or use the dictation feature to speak your thoughts..."
            />

            {/* AI Grading Results */}
            {gradingResult && (
              <div className="mt-8 bg-gray-50 rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Pre-Grading Results</h3>
                </div>

                {/* Overall Score */}
                <div className={`rounded-lg p-4 ${
                  gradingResult.passesThreshold ? 'bg-green-100 border-green-200' : 'bg-yellow-100 border-yellow-200'
                } border`}>
                  <div className="flex items-center space-x-3">
                    {gradingResult.passesThreshold ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Predicted Score: {gradingResult.score}%
                      </h4>
                      <p className={`text-sm ${
                        gradingResult.passesThreshold ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        {gradingResult.passesThreshold 
                          ? 'Ready for submission!' 
                          : 'Consider revising before final submission'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overall Feedback */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Overall Feedback</h4>
                  <p className="text-gray-700">{gradingResult.overallFeedback}</p>
                </div>

                {/* Detailed Breakdown */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Detailed Breakdown</h4>
                  <div className="space-y-3">
                    {gradingResult.breakdown.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-900">{item.criterion}</h5>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            item.score >= 85 ? 'bg-green-100 text-green-800' :
                            item.score >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.score}%
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{item.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                {gradingResult.suggestions.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <h4 className="font-medium text-gray-900">Suggestions for Improvement</h4>
                    </div>
                    <ul className="space-y-2">
                      {gradingResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span className="text-gray-700 text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Final Submit Button */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setGradingResult(null)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Revise Submission
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Final Assignment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Feedback (if graded) */}
        {assignment.status === 'graded' && assignment.feedback && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Final Grade & Feedback</h3>
            <p className="text-gray-700">{assignment.feedback}</p>
            {assignment.grade !== undefined && (
              <p className="mt-2 text-lg font-medium text-gray-900">
                Final Grade: {assignment.grade} / {assignment.points_possible} points
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 