import React, { useState, useEffect } from 'react';
import { mockCanvasApi } from '../lib/mockCanvasApi';

interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  course_id: number;
  submission_type: string;
}

interface Course {
  id: number;
  name: string;
  course_code: string;
}

interface StudyBlock {
  id: number;
  assignmentId: number;
  courseId: number;
  date: string;
  duration: number; // in hours
  completed: boolean;
}

const StudyPlanner: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await mockCanvasApi.courses.list();
        setCourses(coursesData);
        
        // Get assignments for all courses
        const allAssignments: Assignment[] = [];
        for (const course of coursesData) {
          const courseAssignments = await mockCanvasApi.assignments.list(course.id);
          allAssignments.push(...courseAssignments);
        }
        setAssignments(allAssignments);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addStudyBlock = (assignmentId: number, courseId: number, duration: number) => {
    const newBlock: StudyBlock = {
      id: Date.now(),
      assignmentId,
      courseId,
      date: selectedDate,
      duration,
      completed: false
    };
    setStudyBlocks([...studyBlocks, newBlock]);
  };

  const toggleStudyBlock = (blockId: number) => {
    setStudyBlocks(studyBlocks.map(block => 
      block.id === blockId ? { ...block, completed: !block.completed } : block
    ));
  };

  const getUpcomingAssignments = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return assignments
      .filter(assignment => {
        const dueDate = new Date(assignment.due_at);
        return dueDate >= today && dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  };

  const getCourseName = (courseId: number) => {
    return courses.find(course => course.id === courseId)?.name || 'Unknown Course';
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Upcoming Assignments</h2>
        <div className="space-y-4">
          {getUpcomingAssignments().map(assignment => (
            <div key={assignment.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{assignment.name}</h3>
                  <p className="text-sm text-gray-600">{getCourseName(assignment.course_id)}</p>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(assignment.due_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="8"
                    placeholder="Hours"
                    className="w-20 px-2 py-1 border rounded"
                    onChange={(e) => {
                      const duration = parseInt(e.target.value);
                      if (duration > 0) {
                        addStudyBlock(assignment.id, assignment.course_id, duration);
                      }
                    }}
                  />
                  <span className="text-sm text-gray-500">hours</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Study Schedule</h2>
        <div className="mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
        <div className="space-y-4">
          {studyBlocks
            .filter(block => block.date === selectedDate)
            .map(block => {
              const assignment = assignments.find(a => a.id === block.assignmentId);
              return (
                <div
                  key={block.id}
                  className={`border rounded-lg p-4 ${
                    block.completed ? 'bg-green-50' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{assignment?.name}</h3>
                      <p className="text-sm text-gray-600">{getCourseName(block.courseId)}</p>
                      <p className="text-sm text-gray-500">{block.duration} hours</p>
                    </div>
                    <button
                      onClick={() => toggleStudyBlock(block.id)}
                      className={`px-4 py-2 rounded ${
                        block.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {block.completed ? 'Completed' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Weekly Overview</h2>
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const blocksForDay = studyBlocks.filter(block => block.date === dateStr);
            const totalHours = blocksForDay.reduce((sum, block) => sum + block.duration, 0);
            
            return (
              <div key={i} className="border rounded-lg p-2">
                <div className="text-sm font-semibold mb-2">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs text-gray-500">
                  {blocksForDay.length} tasks
                </div>
                <div className="text-xs text-gray-500">
                  {totalHours} hours
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner; 