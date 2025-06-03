'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { FileText, Calendar, Award, Filter, List, Grid, Columns } from 'lucide-react';
import { mockCanvasApi, type Assignment } from '@/lib/mockCanvasApi';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

type ViewType = 'list' | 'grid' | 'kanban';
type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';

const STATUS_COLORS = {
  not_started: 'bg-gray-900 text-gray-300',
  in_progress: 'bg-yellow-900 text-yellow-300',
  submitted: 'bg-blue-900 text-blue-300',
  graded: 'bg-green-900 text-green-300'
} as const;

const STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  graded: 'Graded'
} as const;

// Extracted AssignmentCard component
const AssignmentCard = ({ 
  assignment, 
  getCourseName,
  onDragStart 
}: { 
  assignment: Assignment; 
  getCourseName: (id: number) => string;
  onDragStart: (e: React.DragEvent, assignment: Assignment) => void;
}) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, assignment)}
    className="cursor-move"
  >
    <Link href={`/courses/${slugify(getCourseName(assignment.course_id))}/assignments/${slugify(assignment.name)}`}>
      <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{assignment.name}</h3>
            <p className="text-sm mt-1">{getCourseName(assignment.course_id)}</p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(assignment.due_at), 'MMM d')}
              </div>
              <div className="flex items-center text-sm">
                <Award className="w-4 h-4 mr-1" />
                {assignment.points_possible} pts
              </div>
            </div>
            <div className="mt-4">
              <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[assignment.status]}`}>
                {STATUS_LABELS[assignment.status]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

// Extracted KanbanColumn component
const KanbanColumn = ({ 
  status, 
  assignments, 
  getCourseName,
  onDragStart,
  onDragOver,
  onDrop
}: { 
  status: AssignmentStatus; 
  assignments: Assignment[]; 
  getCourseName: (id: number) => string;
  onDragStart: (e: React.DragEvent, assignment: Assignment) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: AssignmentStatus) => void;
}) => (
  <div 
    className="bg-white rounded-lg p-4"
    onDragOver={onDragOver}
    onDrop={(e) => onDrop(e, status)}
  >
    <h3 className="text-lg font-semibold mb-4">
      {STATUS_LABELS[status]}
    </h3>
    <div className="space-y-4 min-h-[200px]">
      {assignments.map(assignment => (
        <AssignmentCard 
          key={assignment.id} 
          assignment={assignment} 
          getCourseName={getCourseName}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  </div>
);

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [view, setView] = useState<ViewType>('kanban');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsData, coursesData] = await Promise.all([
          mockCanvasApi.getAssignments(),
          mockCanvasApi.getCourses()
        ]);
        setAssignments(assignmentsData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCourseName = useCallback((courseId: number) => {
    return courses.find(course => course.id === courseId)?.name || 'Unknown Course';
  }, [courses]);

  const filteredAssignments = useMemo(() => 
    assignments
      .filter(assignment => !selectedCourse || assignment.course_id === selectedCourse)
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()),
    [assignments, selectedCourse]
  );

  const assignmentsByStatus = useMemo(() => {
    const grouped = {
      not_started: [] as Assignment[],
      in_progress: [] as Assignment[],
      submitted: [] as Assignment[],
      graded: [] as Assignment[]
    };
    
    filteredAssignments.forEach(assignment => {
      grouped[assignment.status].push(assignment);
    });
    
    return grouped;
  }, [filteredAssignments]);

  const handleDragStart = (e: React.DragEvent, assignment: Assignment) => {
    e.dataTransfer.setData('application/json', JSON.stringify(assignment));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: AssignmentStatus) => {
    e.preventDefault();
    const assignmentData = e.dataTransfer.getData('application/json');
    if (!assignmentData) return;

    const assignment: Assignment = JSON.parse(assignmentData);
    if (assignment.status === newStatus) return;

    try {
      // Update the assignment status in the backend
      await mockCanvasApi.updateAssignmentStatus(assignment.id, newStatus);
      
      // Update local state
      setAssignments(prev => 
        prev.map(a => 
          a.id === assignment.id 
            ? { ...a, status: newStatus }
            : a
        )
      );
    } catch (error) {
      console.error('Error updating assignment status:', error);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold ">Assignments</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-white  rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.name}
                </option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded transition-colors ${
                  view === 'list' ? 'bg-white' : 'hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List className="w-5 h-5 " />
              </button>
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded transition-colors ${
                  view === 'grid' ? 'bg-white' : 'hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5 " />
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`p-2 rounded transition-colors ${
                  view === 'kanban' ? 'bg-white' : 'hover:bg-gray-100'
                }`}
                title="Kanban View"
              >
                <Columns className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments View */}
      <div className="transition-all duration-300 ease-in-out">
        {view === 'list' ? (
          <div className="space-y-4">
            {filteredAssignments.map(assignment => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                getCourseName={getCourseName}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map(assignment => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                getCourseName={getCourseName}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(STATUS_LABELS) as AssignmentStatus[]).map(status => (
              <KanbanColumn
                key={status}
                status={status}
                assignments={assignmentsByStatus[status]}
                getCourseName={getCourseName}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}