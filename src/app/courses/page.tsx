'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/lib/userService';
import { mockCanvasApi, type Course } from '@/lib/mockCanvasApi';
import { CourseCard } from '@/components/course-card';
import { CourseGeneratorForm } from '@/components/course-generator-form';
import { ProgressDemo } from '@/components/progress-demo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  BookOpen, 
  GraduationCap, 
  Filter, 
  Clock,
  Users,
  Star,
  Plus,
  X 
} from 'lucide-react';

export default function CoursesPage() {
  const { user, getUserData } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCourseDirectory, setShowCourseDirectory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCourseForDemo, setSelectedCourseForDemo] = useState<Course | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Get user enrollments from their courseProgress keys
      const userData = getUserData();
      const userEnrollments = userData?.courseProgress ? Object.keys(userData.courseProgress) : [];
      
      console.log('📚 Fetching courses for enrollments:', userEnrollments);
      const enrolledCoursesData = await mockCanvasApi.getCourses(userEnrollments);
      console.log('📚 Loaded enrolled courses:', enrolledCoursesData.length);
      setEnrolledCourses(enrolledCoursesData);

      // Get all available courses for directory
      const allCourses = await mockCanvasApi.getCourses();
      const availableCoursesData = allCourses.filter(course => 
        !userEnrollments.includes(course.id.toString())
      );
      setAvailableCourses(availableCoursesData);
      
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user, getUserData]);

  const handleCourseGenerated = () => {
    console.log('🔄 Course generated, refreshing course list...');
    fetchCourses();
  };

  const handleEnroll = async (courseId: number) => {
    if (!user) return;

    try {
      // Get current user data
      const userData = getUserData();
      if (!userData) return;

      // Add course to user's enrollments
      const courseProgress = { ...userData.courseProgress };
      courseProgress[courseId.toString()] = {
        courseId: courseId.toString(),
        enrolledAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        completedModules: [],
        assignmentSubmissions: {},
        quizAttempts: {},
        discussionParticipation: {},
        currentGrade: 0,
        timeSpent: 0
      };

      // Update user data
      const updatedData = {
        ...userData,
        courseProgress
      };

      UserService.saveUserData(user.id, updatedData);
      
      // Refresh courses
      await fetchCourses();
      
      console.log(`✅ Successfully enrolled in course ${courseId}`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const handleProgressUpdate = () => {
    // Force refresh of course data when progress updates
    fetchCourses();
  };

  // Filter available courses based on search and filters
  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = !searchQuery || 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
      course.department === selectedDepartment;
    
    const matchesLevel = selectedLevel === 'all' || 
      (selectedLevel === 'undergraduate' && parseInt(course.course_code.match(/\d+/)?.[0] || '0') < 500) ||
      (selectedLevel === 'graduate' && parseInt(course.course_code.match(/\d+/)?.[0] || '0') >= 500);
    
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  // Get unique departments
  const departments = Array.from(new Set(availableCourses.map(c => c.department))).sort();

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Error Loading Courses</h2>
          <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Courses</h1>
          <p className="text-gray-600 mt-2">
            {enrolledCourses.length} enrolled • {availableCourses.length} available to join
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowCourseDirectory(!showCourseDirectory)}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {showCourseDirectory ? 'Hide' : 'Browse'} Course Directory
          </Button>
        </div>
      </div>

      {/* Course Directory */}
      {showCourseDirectory && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Course Directory
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCourseDirectory(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedDepartment}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDepartment(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLevel(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Levels</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
            </select>
          </div>

          {/* Available Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                showEnrollButton={true}
                onEnroll={handleEnroll}
              />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="space-y-6">
        {enrolledCourses.length === 0 ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
            <GraduationCap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">No Enrolled Courses</h3>
            <p className="text-blue-700 mb-4">
              Browse the course directory above to find courses that interest you, or create a custom course.
            </p>
            <Button 
              onClick={() => setShowCourseDirectory(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Course Creation */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Custom Course
        </h2>
        <p className="text-gray-600 mb-4">
          Use AI to generate a personalized course tailored to your learning goals.
        </p>
        <CourseGeneratorForm onCourseGenerated={handleCourseGenerated} />
      </div>
    </div>
  );
}