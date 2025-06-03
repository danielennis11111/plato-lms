import { addDays, addWeeks, format, startOfMonth, subDays, subWeeks } from 'date-fns';
import { slugify } from '@/lib/utils';

// Helper function to get semester start
function startOfSemester(date: Date): Date {
  const month = date.getMonth();
  // Fall semester starts in August (7), Spring in January (0)
  const semesterMonth = month >= 7 ? 7 : 0;
  return startOfMonth(new Date(date.getFullYear(), semesterMonth, 1));
}

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor';
  enrolled_courses: number[];
}

export interface Course {
  id: number;
  name: string;
  course_code: string;
  description: string;
  instructor: string;
  term: string;
  start_date: string;
  end_date: string;
  modules: Module[];
  syllabus?: string;
  total_points: number;
  current_grade?: number;
}

export interface Module {
  id: number;
  name: string;
  description: string;
  items: ModuleItem[];
  due_date?: string;
  is_completed?: boolean;
}

export interface ModuleItem {
  id: number;
  title: string;
  type: 'assignment' | 'discussion' | 'quiz' | 'page';
  content?: string;
  due_date?: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  points_possible?: number;
  submissions?: number;
  attempts?: number;
  max_attempts?: number;
}

export interface Assignment {
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
  module_id?: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  type: 'assignment' | 'discussion' | 'quiz' | 'module';
  start_date: string;
  end_date: string;
  course_id: number;
  course_name: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  points_possible?: number;
  grade?: number;
}

// Mock Data
const currentDate = new Date('2025-05-30');
const semesterStart = startOfSemester(currentDate);
const semesterEnd = addWeeks(semesterStart, 16);

const currentUser: User = {
  id: 1,
  name: "John Doe",
  email: "john.doe@university.edu",
  role: "student",
  enrolled_courses: [1, 2, 3, 4]
};

const courses: Course[] = [
  {
    id: 1,
    name: 'Introduction to Computer Science',
    course_code: 'CS101',
    description: 'An introductory course to computer science and programming. Learn fundamental concepts including variables, control structures, functions, and object-oriented programming. This course provides hands-on experience with Python programming language.',
    instructor: 'Dr. Smith',
    term: 'Spring 2024',
    total_points: 1000,
    current_grade: 85,
    start_date: '2024-01-15',
    end_date: '2024-05-15',
    syllabus: 'This course covers the fundamentals of computer science and programming. Students will learn Python programming, basic algorithms, and problem-solving techniques.',
    modules: [
      {
        id: 1,
        name: 'Getting Started',
        description: 'Introduction to the course and basic programming concepts',
        is_completed: true,
        items: [
          {
            id: 1,
            title: 'Welcome to CS101',
            type: 'page',
            content: 'Welcome to Introduction to Computer Science! In this course, you will learn the fundamentals of programming using Python. We will cover topics such as variables, control structures, functions, and object-oriented programming.',
            due_date: '2024-01-22T23:59:59Z',
            status: 'graded',
            points_possible: 0
          },
          {
            id: 2,
            title: 'First Programming Assignment',
            type: 'assignment',
            content: 'Complete the Hello World program and basic arithmetic operations in Python. Submit your code and a brief explanation of your approach.',
            due_date: '2024-01-29T23:59:59Z',
            status: 'graded',
            grade: 95,
            feedback: 'Excellent work! Your code is well-structured and includes good comments.',
            points_possible: 100,
            submissions: 1,
            attempts: 1,
            max_attempts: 1
          }
        ]
      },
      {
        id: 2,
        name: 'Variables and Data Types',
        description: 'Learn about different types of data and how to store them',
        is_completed: false,
        items: [
          {
            id: 3,
            title: 'Variables Quiz',
            type: 'quiz',
            content: 'Test your knowledge of variables, data types, and basic operations in Python.',
            due_date: '2024-02-05T23:59:59Z',
            status: 'in_progress',
            grade: undefined,
            points_possible: 50,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 4,
            title: 'Data Types Lab',
            type: 'assignment',
            content: 'Practice working with different data types in Python. Create a program that demonstrates the use of integers, floats, strings, and booleans.',
            due_date: '2024-02-12T23:59:59Z',
            status: 'not_started',
            points_possible: 75,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      },
      {
        id: 3,
        name: 'Control Structures',
        description: 'Learn about loops and conditional statements',
        is_completed: false,
        items: [
          {
            id: 5,
            title: 'Control Structures Discussion',
            type: 'discussion',
            content: 'Discuss the different types of control structures in Python and when to use each one. Share examples from your own code.',
            due_date: '2024-02-19T23:59:59Z',
            status: 'not_started',
            points_possible: 25,
            submissions: 0,
            attempts: 0
          },
          {
            id: 6,
            title: 'Loops and Conditionals Project',
            type: 'assignment',
            content: 'Create a program that uses loops and conditional statements to solve a real-world problem. Include error handling and user input validation.',
            due_date: '2024-02-26T23:59:59Z',
            status: 'not_started',
            points_possible: 100,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Data Structures and Algorithms',
    course_code: 'CS201',
    description: 'Advanced study of data structures and algorithms. Learn about arrays, linked lists, trees, graphs, and various sorting and searching algorithms.',
    instructor: 'Dr. Johnson',
    term: 'Spring 2024',
    total_points: 1000,
    current_grade: 92,
    start_date: '2024-01-15',
    end_date: '2024-05-15',
    syllabus: 'This course covers fundamental data structures and algorithms. Students will learn to analyze algorithm complexity and implement various data structures.',
    modules: [
      {
        id: 4,
        name: 'Arrays and Linked Lists',
        description: 'Study of linear data structures',
        is_completed: true,
        items: [
          {
            id: 7,
            title: 'Array Operations Lab',
            type: 'assignment',
            content: 'Implement and analyze the performance of various array operations including insertion, deletion, and searching.',
            due_date: '2024-01-29T23:59:59Z',
            status: 'graded',
            grade: 98,
            feedback: 'Excellent implementation! Your analysis of time complexity is thorough.',
            points_possible: 100,
            submissions: 1,
            attempts: 1,
            max_attempts: 2
          }
        ]
      }
    ]
  }
];

const assignments: Assignment[] = [
  {
    id: 2,
    name: "First Programming Assignment",
    description: "Complete the Hello World program and basic arithmetic operations in Python. Submit your code and a brief explanation of your approach.",
    due_at: '2024-01-29T23:59:59Z',
    course_id: 1,
    points_possible: 100,
    status: 'graded',
    grade: 95,
    feedback: 'Excellent work! Your code is well-structured and includes good comments.',
    submissions: 1,
    attempts: 1,
    max_attempts: 1,
    module_id: 1
  },
  {
    id: 4,
    name: "Data Types Lab",
    description: "Practice working with different data types in Python. Create a program that demonstrates the use of integers, floats, strings, and booleans.",
    due_at: '2024-02-12T23:59:59Z',
    course_id: 1,
    points_possible: 75,
    status: 'not_started',
    submissions: 0,
    attempts: 0,
    max_attempts: 3,
    module_id: 2
  },
  {
    id: 6,
    name: "Loops and Conditionals Project",
    description: "Create a program that uses loops and conditional statements to solve a real-world problem. Include error handling and user input validation.",
    due_at: '2024-02-26T23:59:59Z',
    course_id: 1,
    points_possible: 100,
    status: 'not_started',
    submissions: 0,
    attempts: 0,
    max_attempts: 2,
    module_id: 3
  },
  {
    id: 7,
    name: "Array Operations Lab",
    description: "Implement and analyze the performance of various array operations including insertion, deletion, and searching.",
    due_at: '2024-01-29T23:59:59Z',
    course_id: 2,
    points_possible: 100,
    status: 'graded',
    grade: 98,
    feedback: 'Excellent implementation! Your analysis of time complexity is thorough.',
    submissions: 1,
    attempts: 1,
    max_attempts: 2,
    module_id: 4
  }
];

const calendarEvents: CalendarEvent[] = [
  // Assignment Events
  ...assignments.map(assignment => ({
    id: assignment.id,
    title: assignment.name,
    type: 'assignment' as const,
    start_date: assignment.due_at,
    end_date: assignment.due_at,
    course_id: assignment.course_id,
    course_name: courses.find(c => c.id === assignment.course_id)?.name || '',
    status: assignment.status,
    points_possible: assignment.points_possible,
    grade: assignment.grade
  })),

  // Module Events
  ...courses.flatMap(course => 
    course.modules.map(module => ({
      id: module.id,
      title: module.name,
      type: 'module' as const,
      start_date: module.due_date || format(addDays(semesterStart, 14), 'yyyy-MM-dd'),
      end_date: module.due_date || format(addDays(semesterStart, 14), 'yyyy-MM-dd'),
      course_id: course.id,
      course_name: course.name,
      status: module.is_completed ? 'graded' as const : 'not_started' as const
    }))
  ),

  // Course-Specific Events
  // CS101 Events
  {
    id: 101,
    title: "CS101 Midterm Exam",
    type: 'quiz' as const,
    start_date: format(addDays(semesterStart, 35), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 35), 'yyyy-MM-dd'),
    course_id: 1,
    course_name: "Introduction to Computer Science",
    points_possible: 200,
    status: 'not_started' as const
  },
  {
    id: 102,
    title: "CS101 Final Project Due",
    type: 'assignment' as const,
    start_date: format(addDays(semesterStart, 98), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 98), 'yyyy-MM-dd'),
    course_id: 1,
    course_name: "Introduction to Computer Science",
    points_possible: 250,
    status: 'not_started' as const
  },
  {
    id: 103,
    title: "CS101 Final Exam",
    type: 'quiz' as const,
    start_date: format(addDays(semesterStart, 105), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 105), 'yyyy-MM-dd'),
    course_id: 1,
    course_name: "Introduction to Computer Science",
    points_possible: 300,
    status: 'not_started' as const
  },

  // CS201 Events
  {
    id: 201,
    title: "CS201 Data Structures Quiz",
    type: 'quiz' as const,
    start_date: format(addDays(semesterStart, 28), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 28), 'yyyy-MM-dd'),
    course_id: 2,
    course_name: "Data Structures and Algorithms",
    points_possible: 100,
    status: 'not_started' as const
  },
  {
    id: 202,
    title: "CS201 Algorithm Analysis Project",
    type: 'assignment' as const,
    start_date: format(addDays(semesterStart, 56), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 56), 'yyyy-MM-dd'),
    course_id: 2,
    course_name: "Data Structures and Algorithms",
    points_possible: 200,
    status: 'not_started' as const
  },
  {
    id: 203,
    title: "CS201 Final Exam",
    type: 'quiz' as const,
    start_date: format(addDays(semesterStart, 105), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 105), 'yyyy-MM-dd'),
    course_id: 2,
    course_name: "Data Structures and Algorithms",
    points_possible: 300,
    status: 'not_started' as const
  },

  // CS301 Events
  {
    id: 301,
    title: "CS301 Frontend Development Quiz",
    type: 'quiz' as const,
    start_date: format(addDays(semesterStart, 21), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 21), 'yyyy-MM-dd'),
    course_id: 3,
    course_name: "Web Development",
    points_possible: 100,
    status: 'not_started' as const
  },
  {
    id: 302,
    title: "CS301 Full-Stack Project",
    type: 'assignment' as const,
    start_date: format(addDays(semesterStart, 84), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 84), 'yyyy-MM-dd'),
    course_id: 3,
    course_name: "Web Development",
    points_possible: 300,
    status: 'not_started' as const
  },
  {
    id: 303,
    title: "CS301 Final Presentation",
    type: 'discussion' as const,
    start_date: format(addDays(semesterStart, 98), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 98), 'yyyy-MM-dd'),
    course_id: 3,
    course_name: "Web Development",
    points_possible: 100,
    status: 'not_started' as const
  },

  // LDT 504 Events
  {
    id: 401,
    title: "LDT 504 Course Start",
    type: 'module' as const,
    start_date: "2025-08-21",
    end_date: "2025-08-21",
    course_id: 4,
    course_name: "eLearning Design and Development",
    status: 'not_started' as const
  },
  {
    id: 402,
    title: "LDT 504 Drop Deadline",
    type: 'module' as const,
    start_date: "2025-08-27",
    end_date: "2025-08-27",
    course_id: 4,
    course_name: "eLearning Design and Development",
    status: 'not_started' as const
  },
  {
    id: 403,
    title: "LDT 504 Withdrawal Deadline",
    type: 'module' as const,
    start_date: "2025-09-10",
    end_date: "2025-09-10",
    course_id: 4,
    course_name: "eLearning Design and Development",
    status: 'not_started' as const
  },
  {
    id: 404,
    title: "LDT 504 Midterm Project Due",
    type: 'assignment' as const,
    start_date: "2025-09-15",
    end_date: "2025-09-15",
    course_id: 4,
    course_name: "eLearning Design and Development",
    points_possible: 30,
    status: 'not_started' as const
  },
  {
    id: 405,
    title: "LDT 504 Final Project Due",
    type: 'assignment' as const,
    start_date: "2025-10-08",
    end_date: "2025-10-08",
    course_id: 4,
    course_name: "eLearning Design and Development",
    points_possible: 50,
    status: 'not_started' as const
  },
  {
    id: 406,
    title: "LDT 504 Course End",
    type: 'module' as const,
    start_date: "2025-10-10",
    end_date: "2025-10-10",
    course_id: 4,
    course_name: "eLearning Design and Development",
    status: 'not_started' as const
  },

  // Course Milestones
  {
    id: 501,
    title: "Semester Start",
    type: 'module' as const,
    start_date: format(semesterStart, 'yyyy-MM-dd'),
    end_date: format(semesterStart, 'yyyy-MM-dd'),
    course_id: 0,
    course_name: "All Courses",
    status: 'graded' as const
  },
  {
    id: 502,
    title: "Midterm Week",
    type: 'module' as const,
    start_date: format(addDays(semesterStart, 35), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 42), 'yyyy-MM-dd'),
    course_id: 0,
    course_name: "All Courses",
    status: 'not_started' as const
  },
  {
    id: 503,
    title: "Final Exam Week",
    type: 'module' as const,
    start_date: format(addDays(semesterStart, 98), 'yyyy-MM-dd'),
    end_date: format(addDays(semesterStart, 105), 'yyyy-MM-dd'),
    course_id: 0,
    course_name: "All Courses",
    status: 'not_started' as const
  }
];

// API Methods
export const mockCanvasApi = {
  getCurrentUser: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return currentUser;
  },

  getCourses: async (): Promise<Course[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return courses;
  },

  getCourse: async (idOrSlug: string | number): Promise<Course | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return courses.find(c => c.id === idOrSlug || slugify(c.name) === idOrSlug) || null;
  },

  getCourseModules: async (courseId: number): Promise<Module[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const course = courses.find(c => c.id === courseId);
    return course?.modules || [];
  },

  getModuleItems: async (courseId: number, moduleId: number): Promise<ModuleItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    return module?.items || [];
  },

  getModuleItem: async (courseId: number, moduleItemId: number): Promise<ModuleItem | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const course = courses.find(c => c.id === courseId);
    const moduleItem = course?.modules
      .flatMap(module => module.items)
      .find(item => item.id === moduleItemId);
    return moduleItem || null;
  },

  getAssignmentByName: async (courseId: number, assignmentName: string): Promise<Assignment | null> => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;

    // Find the module item that corresponds to this assignment
    const moduleItem = course.modules
      .flatMap(module => module.items)
      .find(item => item.type === 'assignment' && slugify(item.title) === assignmentName);

    if (!moduleItem) return null;

    // Create an assignment object from the module item
    return {
      id: moduleItem.id,
      name: moduleItem.title,
      description: moduleItem.content || '',
      due_at: moduleItem.due_date || new Date().toISOString(),
      course_id: course.id,
      points_possible: moduleItem.points_possible || 100,
      status: moduleItem.status,
      grade: moduleItem.grade,
      feedback: moduleItem.feedback,
      submissions: moduleItem.submissions || 0,
      attempts: moduleItem.attempts || 0,
      max_attempts: moduleItem.max_attempts || 1,
      module_id: moduleItem.id
    };
  },

  getCalendarEvents: async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
    const events: CalendarEvent[] = [];

    // Add assignments
    courses.forEach(course => {
      course.modules.forEach(module => {
        module.items.forEach(item => {
          if (item.due_date && item.type !== 'page') {
            const dueDate = new Date(item.due_date);
            if (dueDate >= startDate && dueDate <= endDate) {
              const event: CalendarEvent = {
                id: item.id,
                title: item.title,
                type: item.type as 'assignment' | 'discussion' | 'quiz' | 'module',
                start_date: item.due_date,
                end_date: item.due_date,
                course_id: course.id,
                course_name: course.name,
                status: item.status,
                points_possible: item.points_possible,
                grade: item.grade
              };
              events.push(event);
            }
          }
        });
      });
    });

    // Add module events
    courses.forEach(course => {
      course.modules.forEach(module => {
        if (module.due_date) {
          const dueDate = new Date(module.due_date);
          if (dueDate >= startDate && dueDate <= endDate) {
            const event: CalendarEvent = {
              id: module.id,
              title: module.name,
              type: 'module',
              start_date: module.due_date,
              end_date: module.due_date,
              course_id: course.id,
              course_name: course.name,
              status: module.is_completed ? 'graded' : 'not_started'
            };
            events.push(event);
          }
        }
      });
    });

    return events;
  },

  addCourse: async (course: Course): Promise<Course> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    courses.push(course);
    return course;
  },

  getAssignments: async (): Promise<Assignment[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return assignments;
  },

  getCourseAssignments: async (courseId: number): Promise<Assignment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return assignments.filter(assignment => assignment.course_id === courseId);
  },

  updateAssignmentStatus: async (assignmentId: number, status: Assignment['status']): Promise<Assignment> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    assignment.status = status;
    return assignment;
  },

  getAssignmentById: async (moduleItemId: number): Promise<Assignment | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return assignments.find(a => a.id === moduleItemId);
  },

  deleteCourse: async (courseId: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
      courses.splice(index, 1);
    }
  }
}; 