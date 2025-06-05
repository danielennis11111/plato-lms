'use client';

import { Course } from '@/lib/mockCanvasApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, BookOpen, Calendar, User, Award, Target } from 'lucide-react';
import { deleteCourse } from '@/app/actions/courses';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  showEnrollButton?: boolean;
  onEnroll?: (courseId: number) => void;
}

export function CourseCard({ course, showEnrollButton = false, onEnroll }: CourseCardProps) {
  const router = useRouter();
  const { getUserData } = useAuth();

  // Get user progress data
  const userData = getUserData();
  const courseProgress = userData?.courseProgress?.[course.id.toString()];
  
  // Calculate completion percentage from user's completed modules (cap at 100%)
  const completedModules = courseProgress?.completedModules?.length || 0;
  const totalModules = course.modules?.length || 1;
  const completionPercentage = Math.min((completedModules / totalModules) * 100, 100);
  
  // Get current grade from user's course progress or course data (cap at 100%)
  const userGrade = courseProgress?.currentGrade || 0;
  const courseGrade = course.current_grade || 0;
  const currentGrade = courseProgress ? Math.min(userGrade, 100) : Math.min(courseGrade, 100);
  
  // Use only user's individual progress (not course template completion status)
  const displayProgress = completionPercentage;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this course?')) {
      const result = await deleteCourse(course.id);
      if (result.success) {
        router.refresh();
      } else {
        alert('Failed to delete course');
      }
    }
  };

  const handleEnroll = () => {
    if (onEnroll) {
      onEnroll(course.id);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (grade >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{course.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <BookOpen className="w-4 h-4" />
              {course.course_code}
            </CardDescription>
          </div>
          {currentGrade > 0 && (
            <Badge variant="outline" className={`ml-2 ${getGradeColor(currentGrade)}`}>
              <Award className="w-3 h-3 mr-1" />
              {Math.round(currentGrade)}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
        
        {/* Course Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 truncate">{course.instructor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{course.term}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{course.credits} credits</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{course.modules?.length || 0} modules</span>
          </div>
        </div>

        {/* Progress Section */}
        {!showEnrollButton && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{Math.round(displayProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(displayProgress)}`}
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Department Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {course.department || 'General Studies'}
          </Badge>
          {course.room_location && (
            <Badge variant="outline" className="text-xs">
              {course.room_location}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-4">
        {showEnrollButton ? (
          <>
            <Button variant="outline" onClick={handleEnroll} className="flex-1 mr-2">
              <BookOpen className="h-4 w-4 mr-2" />
              Enroll
            </Button>
            <Link href={`/courses/${slugify(course.name)}`}>
              <Button variant="ghost" size="sm">
                Preview
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href={`/courses/${slugify(course.name)}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                View Course
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
} 