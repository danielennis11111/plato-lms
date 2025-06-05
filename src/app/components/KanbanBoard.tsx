import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { mockCanvasApi, Assignment as CanvasAssignment } from '../../lib/mockCanvasApi';

interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  course_id: number;
  status: 'todo' | 'in_progress' | 'completed';
}

interface Course {
  id: number;
  name: string;
  course_code: string;
}

const KanbanBoard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await mockCanvasApi.getCourses();
        setCourses(coursesData);
        
        const allAssignments: Assignment[] = [];
        for (const course of coursesData) {
          const courseAssignments = await mockCanvasApi.getCourseAssignments(course.id);
          // Add status to each assignment
          const assignmentsWithStatus = courseAssignments.map((assignment: CanvasAssignment): Assignment => ({
            id: assignment.id,
            name: assignment.name,
            description: assignment.description,
            due_at: assignment.due_at,
            points_possible: assignment.points_possible,
            course_id: assignment.course_id,
            status: 'todo' as const
          }));
          allAssignments.push(...assignmentsWithStatus);
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

  const getCourseName = (courseId: number) => {
    return courses.find(course => course.id === courseId)?.name || 'Unknown Course';
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newStatus = destination.droppableId as 'todo' | 'in_progress' | 'completed';

    setAssignments(prevAssignments => {
      const newAssignments = [...prevAssignments];
      const [movedAssignment] = newAssignments.splice(source.index, 1);
      movedAssignment.status = newStatus;
      newAssignments.splice(destination.index, 0, movedAssignment);
      return newAssignments;
    });
  };

  const columns = {
    todo: {
      title: 'To Do',
      items: assignments.filter(a => a.status === 'todo')
    },
    in_progress: {
      title: 'In Progress',
      items: assignments.filter(a => a.status === 'in_progress')
    },
    completed: {
      title: 'Completed',
      items: assignments.filter(a => a.status === 'completed')
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">{column.title}</h2>
              <Droppable droppableId={columnId}>
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 min-h-[200px]"
                  >
                    {column.items.map((assignment, index) => (
                      <Draggable
                        key={assignment.id}
                        draggableId={assignment.id.toString()}
                        index={index}
                      >
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded-lg shadow-sm"
                          >
                            <h3 className="font-medium">{assignment.name}</h3>
                            <p className="text-sm text-gray-600">
                              {getCourseName(assignment.course_id)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Due: {new Date(assignment.due_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {assignment.points_possible} points
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard; 