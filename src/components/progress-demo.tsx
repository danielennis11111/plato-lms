'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/lib/userService';
import { Course } from '@/lib/mockCanvasApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Play, 
  Award, 
  Clock,
  BookOpen,
  Target
} from 'lucide-react';

interface ProgressDemoProps {
  course: Course;
  onProgressUpdate?: () => void;
}

export function ProgressDemo({ course, onProgressUpdate }: ProgressDemoProps) {
  const { user, getUserData } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const userData = getUserData();
  const courseProgress = userData?.courseProgress?.[course.id.toString()];
  
  if (!courseProgress) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <BookOpen className="w-4 h-4 inline mr-2" />
          Enroll in this course to start tracking your progress!
        </p>
      </div>
    );
  }

  const completedModules = courseProgress.completedModules || [];
  const totalModules = course.modules?.length || 0;
  const progressPercentage = totalModules > 0 ? (completedModules.length / totalModules) * 100 : 0;

  const handleModuleComplete = async (moduleId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = UserService.markModuleComplete(user.id, course.id.toString(), moduleId);
      
      if (result.success) {
        // Simulate gaining points/grade improvement
        const currentGrade = courseProgress.currentGrade || 0;
        const newGrade = Math.min(currentGrade + 15, 100); // Add 15 points per module
        
        UserService.updateCourseGrade(user.id, course.id.toString(), newGrade);
        
        if (onProgressUpdate) {
          onProgressUpdate();
        }
      }
    } catch (error) {
      console.error('Error completing module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateAssignment = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Simulate assignment submission with random grade 80-95
      const grade = Math.floor(Math.random() * 16) + 80;
      const assignmentId = `demo_assignment_${Date.now()}`;
      
      const result = UserService.recordAssignmentSubmission(
        user.id, 
        course.id.toString(), 
        assignmentId, 
        grade
      );
      
      if (result.success && onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Course Progress Demo
        </h3>
        <Badge variant="outline" className="flex items-center gap-1">
          <Award className="w-3 h-3" />
          {courseProgress.currentGrade || 0}%
        </Badge>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
        <p className="text-xs text-gray-500">
          {completedModules.length} of {totalModules} modules completed
        </p>
      </div>

      {/* Module Progress */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Learning Modules</h4>
        {course.modules?.map((module, index) => {
          const isCompleted = completedModules.includes(module.id.toString());
          
          return (
            <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-sm">{module.name}</p>
                  <p className="text-xs text-gray-600">{module.description}</p>
                </div>
              </div>
              
              {!isCompleted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleModuleComplete(module.id.toString())}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  Complete
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Demo Actions */}
      <div className="border-t pt-4 space-y-3">
        <h4 className="font-medium text-gray-900">Demo Actions</h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSimulateAssignment}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <Award className="w-3 h-3" />
            Submit Assignment
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (user) {
                UserService.addStudyTime(user.id, course.id.toString(), 30);
                if (onProgressUpdate) onProgressUpdate();
              }
            }}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            +30 Min Study
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          Use these buttons to simulate course progression and see your progress update in real-time!
        </p>
      </div>

      {/* Study Stats */}
      {courseProgress.timeSpent > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <Clock className="w-4 h-4 inline mr-1" />
            Total study time: {courseProgress.timeSpent} minutes
          </p>
        </div>
      )}
    </div>
  );
} 