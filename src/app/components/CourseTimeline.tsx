'use client';

import { useState } from 'react';
import { mockCanvasApi } from '@/lib/mockCanvasApi';

interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  status: string;
  score: number | null;
  feedback: string | null;
  rubric: Array<{
    description: string;
    points: number;
    score: number | null;
  }>;
}

interface Module {
  id: number;
  name: string;
  description: string;
  items: Array<{
    id: number;
    type: 'assignment' | 'discussion' | 'quiz' | 'page';
    title: string;
    url: string;
  }>;
}

interface CourseTimelineProps {
  courseId: number;
  courseName: string;
}

export default function CourseTimeline({ courseId, courseName }: CourseTimelineProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'modules'>('timeline');

  // Mock modules data
  const mockModules: Module[] = [
    {
      id: 1,
      name: 'Introduction to Programming',
      description: 'Basic programming concepts and Python fundamentals',
      items: [
        { id: 1, type: 'assignment', title: 'Python Basics Quiz', url: '#' },
        { id: 2, type: 'discussion', title: 'Programming Discussion', url: '#' },
      ],
    },
    {
      id: 2,
      name: 'Data Structures',
      description: 'Understanding and implementing basic data structures',
      items: [
        { id: 3, type: 'assignment', title: 'Data Structures Lab', url: '#' },
        { id: 4, type: 'quiz', title: 'Data Structures Quiz', url: '#' },
      ],
    },
  ];

  const statusColors = {
    'not_started': 'bg-gray-100 text-gray-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'submitted': 'bg-purple-100 text-purple-800',
  };

  const updateAssignmentStatus = async (assignmentId: number, newStatus: string) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === assignmentId
          ? { ...assignment, status: newStatus }
          : assignment
      )
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Timeline</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'timeline'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('modules')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'modules'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Module View
          </button>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        // Timeline View
        <div className="space-y-6">
          {mockModules.map(module => (
            <div key={module.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
              <p className="text-gray-600 mb-4">{module.description}</p>
              <div className="space-y-4">
                {module.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === 'assignment' ? 'bg-blue-500' :
                        item.type === 'quiz' ? 'bg-purple-500' :
                        item.type === 'discussion' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        className="px-3 py-1 rounded-md border border-gray-300 text-sm"
                        onChange={(e) => updateAssignmentStatus(item.id, e.target.value)}
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="submitted">Submitted</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => {/* Handle view details */}}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Module View
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockModules.map(module => (
            <div key={module.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
              <p className="text-gray-600 mb-4">{module.description}</p>
              <div className="space-y-2">
                {module.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'quiz' ? 'bg-purple-100 text-purple-800' :
                        item.type === 'discussion' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.type}
                      </span>
                      <span>{item.title}</span>
                    </div>
                    <select
                      className="px-2 py-1 rounded-md border border-gray-300 text-sm"
                      onChange={(e) => updateAssignmentStatus(item.id, e.target.value)}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="submitted">Submitted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedAssignment.name}</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-500 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedAssignment.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Due Date</h4>
                    <p className="text-gray-600">
                      {new Date(selectedAssignment.due_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Points</h4>
                    <p className="text-gray-600">{selectedAssignment.points_possible} points</p>
                  </div>
                </div>
                {selectedAssignment.score !== null && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Score</h4>
                    <p className="text-gray-600">
                      {selectedAssignment.score}/{selectedAssignment.points_possible}
                    </p>
                    {selectedAssignment.feedback && (
                      <div className="mt-2">
                        <h4 className="font-semibold text-gray-900 mb-2">Feedback</h4>
                        <p className="text-gray-600">{selectedAssignment.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 