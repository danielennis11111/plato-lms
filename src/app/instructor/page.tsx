'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockCanvasApi, Course } from '@/lib/mockCanvasApi';
import MainLayout from '@/app/components/MainLayout';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  Target,
  Brain,
  MessageCircle,
  Settings,
  Plus
} from 'lucide-react';

interface CourseAnalytics {
  courseId: number;
  courseName: string;
  studentCount: number;
  completionRate: number;
  averageGrade: number;
  strugglingStudents: number;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  issueAreas: string[];
  recommendations: string[];
}

interface DepartmentOverview {
  totalCourses: number;
  totalStudents: number;
  overallCompletion: number;
  averageGrade: number;
  flaggedCourses: number;
}

export default function InstructorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [overview, setOverview] = useState<DepartmentOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isInstructor = (user as any)?.role === 'instructor';
  const isDesigner = (user as any)?.role === 'instructional_designer';

  useEffect(() => {
    if (isAuthenticated && (isInstructor || isDesigner)) {
      loadInstructorData();
    }
  }, [isAuthenticated, user]);

  const loadInstructorData = async () => {
    try {
      setIsLoading(true);
      
      // Get courses based on role
      let teachingCourses: Course[] = [];
      
      if (isInstructor) {
        // Faculty sees their teaching courses
        const teachingIds = (user as any)?.teaching_courses || [1, 3];
        const allCourses = await mockCanvasApi.getCourses();
        teachingCourses = allCourses.filter(c => teachingIds.includes(c.id));
      } else if (isDesigner) {
        // ID sees their portfolio courses
        const portfolioIds = (user as any)?.teaching_courses || [1, 2, 3, 4, 5, 6];
        const allCourses = await mockCanvasApi.getCourses();
        teachingCourses = allCourses.filter(c => portfolioIds.includes(c.id));
      }

      setCourses(teachingCourses);

      // Generate analytics for each course
      const courseAnalytics = await Promise.all(
        teachingCourses.map(async (course) => generateCourseAnalytics(course))
      );
      setAnalytics(courseAnalytics);

      // Calculate department overview
      const deptOverview = calculateDepartmentOverview(courseAnalytics);
      setOverview(deptOverview);

    } catch (error) {
      console.error('Error loading instructor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCourseAnalytics = async (course: Course): Promise<CourseAnalytics> => {
    // Simulate realistic analytics data
    const studentCount = Math.floor(Math.random() * 30) + 15; // 15-45 students
    const completionRate = Math.floor(Math.random() * 40) + 60; // 60-100%
    const averageGrade = Math.floor(Math.random() * 25) + 75; // 75-100%
    const strugglingStudents = Math.floor(studentCount * (Math.random() * 0.3)); // 0-30% struggling

    // Determine health based on metrics
    let health: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    if (completionRate >= 90 && averageGrade >= 85) health = 'excellent';
    else if (completionRate >= 80 && averageGrade >= 80) health = 'good';
    else if (completionRate >= 70 || averageGrade >= 75) health = 'warning';
    else health = 'critical';

    // Generate relevant issue areas and recommendations
    const issueAreas: string[] = [];
    const recommendations: string[] = [];

    if (completionRate < 80) {
      issueAreas.push('Low completion rates');
      recommendations.push('Review assignment deadlines and workload distribution');
    }
    if (averageGrade < 80) {
      issueAreas.push('Grade performance');
      recommendations.push('Consider additional scaffolding for key concepts');
    }
    if (strugglingStudents > studentCount * 0.2) {
      issueAreas.push('Student retention');
      recommendations.push('Implement early intervention strategies');
    }

    // Course-specific insights
    if (course.name.includes('Web Development')) {
      if (Math.random() > 0.7) {
        issueAreas.push('JavaScript fundamentals');
        recommendations.push('Add more interactive coding exercises');
      }
    } else if (course.name.includes('Database')) {
      if (Math.random() > 0.6) {
        issueAreas.push('Normalization concepts');
        recommendations.push('Provide visual examples of database design');
      }
    } else if (course.name.includes('Literature')) {
      if (Math.random() > 0.8) {
        issueAreas.push('Critical analysis skills');
        recommendations.push('Include more guided analysis templates');
      }
    }

    return {
      courseId: course.id,
      courseName: course.name,
      studentCount,
      completionRate,
      averageGrade,
      strugglingStudents,
      health,
      issueAreas: issueAreas.length > 0 ? issueAreas : ['No major issues identified'],
      recommendations: recommendations.length > 0 ? recommendations : ['Course performing well - maintain current approach']
    };
  };

  const calculateDepartmentOverview = (analytics: CourseAnalytics[]): DepartmentOverview => {
    const totalStudents = analytics.reduce((sum, a) => sum + a.studentCount, 0);
    const avgCompletion = analytics.reduce((sum, a) => sum + a.completionRate, 0) / analytics.length;
    const avgGrade = analytics.reduce((sum, a) => sum + a.averageGrade, 0) / analytics.length;
    const flagged = analytics.filter(a => a.health === 'warning' || a.health === 'critical').length;

    return {
      totalCourses: analytics.length,
      totalStudents,
      overallCompletion: Math.round(avgCompletion),
      averageGrade: Math.round(avgGrade),
      flaggedCourses: flagged
    };
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <TrendingUp className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated || (!isInstructor && !isDesigner)) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600">This dashboard is only available to faculty and instructional designers.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading instructor dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isInstructor ? 'Faculty Dashboard' : 'Instructional Design Dashboard'}
          </h1>
          <p className="text-gray-600">
            {isInstructor 
              ? 'Monitor your courses and student progress with AI-powered insights'
              : 'Oversee course portfolio and analyze learning effectiveness across departments'
            }
          </p>
        </div>

        {/* Department Overview */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.totalCourses}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.totalStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.overallCompletion}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <AlertTriangle className={`w-8 h-8 mr-3 ${overview.flaggedCourses > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-600">Flagged Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.flaggedCourses}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {analytics.map((course) => (
            <div key={course.courseId} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{course.courseName}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getHealthColor(course.health)}`}>
                  {getHealthIcon(course.health)}
                  {course.health}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-xl font-bold text-gray-900">{course.studentCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion</p>
                  <p className="text-xl font-bold text-gray-900">{course.completionRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Grade</p>
                  <p className="text-xl font-bold text-gray-900">{course.averageGrade}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">At Risk</p>
                  <p className="text-xl font-bold text-red-600">{course.strugglingStudents}</p>
                </div>
              </div>

              {/* Issue Areas */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Issue Areas:</h4>
                <div className="flex flex-wrap gap-1">
                  {course.issueAreas.map((issue, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  AI Recommendations:
                </h4>
                <ul className="space-y-1">
                  {course.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-1">
                      <span className="text-blue-600 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  View Details
                </button>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Ask AI Coach
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Plus className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Create Course</p>
              <p className="text-sm text-gray-600">AI-assisted course design</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Analytics Report</p>
              <p className="text-sm text-gray-600">Generate detailed insights</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Brain className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">AI Consultation</p>
              <p className="text-sm text-gray-600">Course improvement advice</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Settings className="w-6 h-6 text-gray-600 mb-2" />
              <p className="font-medium text-gray-900">Manage Courses</p>
              <p className="text-sm text-gray-600">Edit course settings</p>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 