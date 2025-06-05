'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockCanvasApi, type Course, type CourseAnalytics } from '@/lib/mockCanvasApi';
import MainLayout from '@/app/components/MainLayout';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Brain,
  MessageSquare,
  FileText,
  Award,
  Target
} from 'lucide-react';

interface CourseDisplayData {
  course: Course;
  analytics: CourseAnalytics;
}

export default function InstructorAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const [courseData, setCourseData] = useState<CourseDisplayData[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = (user as any)?.role;
      const teachingCourses = (user as any)?.teaching_courses || [];
      const portfolioCourses = (user as any)?.portfolio_courses || [];
      const relevantCourses = userRole === 'instructor' ? teachingCourses : portfolioCourses;
      
      if (relevantCourses.length > 0) {
        loadCourseAnalytics(relevantCourses);
      }
    }
  }, [user, isAuthenticated]);

  const loadCourseAnalytics = async (courseIds: number[]) => {
    try {
      setLoading(true);
      const dataPromises = courseIds.map(async (id) => {
        const [course, analytics] = await Promise.all([
          mockCanvasApi.getCourse(id),
          mockCanvasApi.getCourseAnalytics(id)
        ]);
        return course ? { course, analytics } : null;
      });
      
      const results = await Promise.all(dataPromises);
      const validData = results.filter((item): item is CourseDisplayData => 
        item !== null && item.analytics !== null
      );
      
      setCourseData(validData);
      if (validData.length > 0) {
        setSelectedCourse(validData[0].course.id);
      }
    } catch (error) {
      console.error('Error loading course analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthIndicator = (analytics: CourseAnalytics) => {
    const riskCount = analytics.risk_factors.length;
    if (riskCount === 0) return { status: 'excellent', color: 'text-green-600 bg-green-50', label: 'Excellent' };
    if (riskCount <= 2) return { status: 'good', color: 'text-blue-600 bg-blue-50', label: 'Good' };
    if (riskCount <= 3) return { status: 'warning', color: 'text-yellow-600 bg-yellow-50', label: 'Needs Attention' };
    return { status: 'critical', color: 'text-red-600 bg-red-50', label: 'Critical' };
  };

  const selectedData = courseData.find(d => d.course.id === selectedCourse);
  const userRole = (user as any)?.role;

  if (!isAuthenticated || (userRole !== 'instructor' && userRole !== 'instructional_designer')) {
    return (
      <MainLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to faculty and instructional designers.</p>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'instructor' ? 'Course Analytics' : 'Portfolio Analytics'}
          </h1>
          <p className="text-gray-600 mt-2">
            {userRole === 'instructor' 
              ? 'Comprehensive insights into your teaching performance and student engagement'
              : 'Instructional design metrics and course health indicators across your portfolio'
            }
          </p>
        </div>

        {courseData.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Course for Detailed Analysis
            </label>
            <select
              id="course-select"
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              {courseData.map((data) => (
                <option key={data.course.id} value={data.course.id}>
                  {data.course.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedData.analytics.enrollment_count}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedData.analytics.active_students} active this week
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Grade</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedData.analytics.average_grade}%</p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedData.analytics.student_performance?.filter(s => s.current_grade > 90).length || 0} top performers
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.round(selectedData.analytics.completion_rate * 100)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedData.analytics.student_performance?.filter(s => s.at_risk).length || 0} need support
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Engagement</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.round(selectedData.analytics.discussion_engagement)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  avg discussion posts per student
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Health Status</h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthIndicator(selectedData.analytics).color}`}>
                  {getHealthIndicator(selectedData.analytics).label}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Brain className="h-4 w-4 mr-1" />
                  {selectedData.analytics.ai_detection_flags} AI detection flags
                </div>
              </div>

              {selectedData.analytics.risk_factors.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Risk Factors:</h3>
                  <ul className="space-y-1">
                    {selectedData.analytics.risk_factors.map((risk: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-2">AI Recommendations:</h3>
                <ul className="space-y-1">
                  {selectedData.analytics.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">Discussion Engagement</span>
                    </div>
                    <span className="font-medium">{Math.round(selectedData.analytics.discussion_engagement)} posts/student</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">Submission Rate</span>
                    </div>
                    <span className="font-medium">{Math.round(selectedData.analytics.assignment_submission_rate * 100)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm text-gray-600">AI Detection Flags</span>
                    </div>
                    <span className="font-medium">{selectedData.analytics.ai_detection_flags}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-sm text-gray-600">Active Students</span>
                    </div>
                    <span className="font-medium">{selectedData.analytics.active_students}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Grade Distribution</h2>
                <div className="space-y-3">
                  {selectedData.analytics.grade_distribution.map((grade: any) => (
                    <div key={grade.range} className="flex items-center">
                      <span className="w-16 text-sm font-medium text-gray-600">{grade.range}:</span>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${grade.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{grade.count} students</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
} 