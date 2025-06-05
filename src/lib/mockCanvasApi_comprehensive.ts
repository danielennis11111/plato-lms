import { addDays, addWeeks, format, startOfMonth, subDays, subWeeks, addMonths } from 'date-fns';
import { slugify } from '@/lib/utils';

// Current date reference: June 4, 2025
const TODAY = new Date('2025-06-04');
const CURRENT_SEMESTER_START = new Date('2025-05-12'); // Summer 2025 started May 12
const CURRENT_SEMESTER_END = new Date('2025-08-15'); // Summer 2025 ends August 15

// Helper function to generate realistic dates relative to June 4, 2025
function getRelativeDate(daysFromToday: number): string {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString();
}

// Enhanced interfaces for comprehensive LMS
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'instructional_designer';
  enrolled_courses: number[];
  teaching_courses?: number[];
  specializations?: string[];
  department?: string;
}

export interface Course {
  id: number;
  name: string;
  course_code: string;
  description: string;
  instructor: string;
  instructor_email: string;
  term: string;
  start_date: string;
  end_date: string;
  modules: Module[];
  syllabus?: string;
  total_points: number;
  current_grade?: number;
  department: string;
  credits: number;
  prerequisites?: string[];
  room_location?: string;
  meeting_times: string;
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
  submission_type?: string;
  requirements?: string[];
  rubric?: Array<{criterion: string, points: number, description: string}>;
  quiz_details?: {
    time_limit: number;
    allowed_attempts: number;
    questions: any[];
  };
}

export interface CalendarEvent {
  id: number;
  title: string;
  type: 'assignment' | 'discussion' | 'quiz' | 'lecture' | 'exam' | 'office_hours';
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  course_id: number;
  course_name: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'upcoming' | 'completed';
  points_possible?: number;
  grade?: number;
  description?: string;
  location?: string;
  priority?: 'high' | 'medium' | 'low';
  reminder_set?: boolean;
}

export interface StudentPerformance {
  student_id: string;
  student_name: string;
  student_email: string;
  current_grade: number;
  assignment_completion_rate: number;
  discussion_posts: number;
  last_activity: string;
  at_risk: boolean;
  engagement_level: 'high' | 'medium' | 'low';
  assignment_submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  assignment_id: number;
  assignment_name: string;
  submitted_at: string;
  grade: number;
  ai_detection_score: number;
  flagged_for_ai: boolean;
  submission_text?: string;
  feedback?: string;
}

export interface CourseAnalytics {
  course_id: number;
  enrollment_count: number;
  active_students: number;
  average_grade: number;
  completion_rate: number;
  discussion_engagement: number;
  assignment_submission_rate: number;
  ai_detection_flags: number;
  weekly_activity: number[];
  grade_distribution: { range: string; count: number; percentage: number }[];
  student_performance: StudentPerformance[];
  risk_factors: string[];
  recommendations: string[];
}

// Comprehensive course catalog with proper faculty connections
const courses: Course[] = [
  // Computer Science Courses (Dr. Sarah Martinez)
  {
    id: 1,
    name: 'Advanced Web Development',
    course_code: 'CS380',
    description: 'Master modern web development with React, Next.js, Node.js, and cloud deployment. Build full-stack applications using TypeScript, database integration, authentication, and real-time features.',
    instructor: 'Dr. Sarah Martinez',
    instructor_email: 'faculty@plato.edu',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 87,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Computer Science',
    credits: 4,
    prerequisites: ['CS250 Data Structures', 'CS270 Web Fundamentals'],
    room_location: 'ENGR 205',
    meeting_times: 'MWF 10:00-10:50 AM, Lab: T 2:00-4:50 PM',
    syllabus: `Course Overview:
Advanced Web Development provides comprehensive training in modern full-stack development. Students will master React 18, Next.js 14, TypeScript, Node.js, and cloud deployment strategies.

Learning Objectives:
• Master React 18 features including hooks, context, and performance optimization
• Build scalable applications using Next.js App Router and server components
• Implement secure authentication and authorization systems
• Design and develop RESTful APIs with Node.js and Express
• Integrate databases (PostgreSQL, MongoDB) with proper ORM/ODM usage
• Deploy applications using modern cloud platforms and CI/CD pipelines

Prerequisites: CS250 (Data Structures), CS270 (Web Fundamentals), CS280 (Database Systems)

Assessment Breakdown:
• Programming Assignments (40%): 6 major projects
• Quizzes & Participation (20%): Weekly assessments and discussion forums
• Midterm Project (20%): Full-stack application
• Final Capstone Project (20%): Industry-sponsored project

Course Schedule: MWF 10:00-10:50 AM, Lab: T 2:00-4:50 PM
Office Hours: MW 2:00-4:00 PM or by appointment`,
    modules: [
      {
        id: 1,
        name: 'React Fundamentals Review',
        description: 'Quick review of React basics and introduction to advanced patterns',
        is_completed: true,
        items: [
          {
            id: 1,
            title: 'React Hooks Deep Dive',
            type: 'page',
            content: 'Comprehensive guide to React hooks including useState, useEffect, useContext, and custom hooks.',
            due_date: getRelativeDate(-13),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 2,
            title: 'Component Architecture Quiz',
            type: 'quiz',
            content: 'Test your understanding of React component patterns, prop drilling, and state management strategies.',
            due_date: getRelativeDate(-8),
            status: 'graded',
            grade: 92,
            feedback: 'Great understanding of component patterns!',
            points_possible: 50,
            submissions: 1,
            attempts: 1,
            max_attempts: 2
          }
        ]
      },
      {
        id: 2,
        name: 'Next.js and Server-Side Rendering',
        description: 'Learn Next.js framework and modern SSR techniques',
        is_completed: true,
        items: [
          {
            id: 3,
            title: 'Next.js App Router Project',
            type: 'assignment',
            content: 'Build a blog application using Next.js 14 App Router. Implement server components, client components, and proper data fetching patterns.',
            due_date: getRelativeDate(-2),
            status: 'submitted',
            grade: 88,
            feedback: 'Excellent implementation of App Router. Consider optimizing image loading.',
            points_possible: 100,
            submissions: 1,
            attempts: 1,
            max_attempts: 2
          }
        ]
      },
      {
        id: 3,
        name: 'Database Integration & APIs',
        description: 'Backend development with databases and RESTful APIs',
        is_completed: false,
        items: [
          {
            id: 4,
            title: 'Database Design Discussion',
            type: 'discussion',
            content: 'Discuss normalization, relationships, and NoSQL vs SQL database choices for web applications.',
            due_date: getRelativeDate(4),
            status: 'in_progress',
            points_possible: 25,
            submissions: 0,
            attempts: 0
          },
          {
            id: 5,
            title: 'REST API Development',
            type: 'assignment',
            content: 'Create a full REST API with CRUD operations, authentication middleware, and proper error handling.',
            due_date: getRelativeDate(6),
            status: 'not_started',
            points_possible: 150,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      }
    ]
  },
  
  // Philosophy Course (Dr. Sarah Martinez also teaching)
  {
    id: 2,
    name: 'Introduction to Philosophy',
    course_code: 'PHI101',
    description: 'Explore fundamental philosophical questions about reality, knowledge, morality, and human existence through the works of major philosophers.',
    instructor: 'Dr. Sarah Martinez',
    instructor_email: 'faculty@plato.edu',
    term: 'Summer 2025',
    total_points: 800,
    current_grade: 91,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Philosophy',
    credits: 3,
    prerequisites: [],
    room_location: 'PHIL 120',
    meeting_times: 'TR 9:30-10:45 AM',
    syllabus: `Course Description:
This course introduces students to the central questions, methods, and figures of philosophy. We will examine fundamental questions about the nature of reality, knowledge, morality, and human existence.

Course Objectives:
• Develop critical thinking and analytical reasoning skills
• Understand major philosophical problems and approaches
• Learn to construct and evaluate philosophical arguments
• Apply philosophical thinking to contemporary issues
• Improve written and oral communication skills

Major Topics:
Week 1-2: What is Philosophy? Ancient Greek Foundations
Week 3-4: Theory of Knowledge (Epistemology)
Week 5-6: Metaphysics and Reality
Week 7-8: Ethics and Moral Philosophy
Week 9-10: Political Philosophy and Justice
Week 11-12: Philosophy of Mind and Personal Identity
Week 13-14: Contemporary Issues and Applied Philosophy

Assessment:
• Participation and Discussion (20%)
• Short Papers (30%): 3 papers, 750 words each
• Midterm Exam (25%)
• Final Exam (25%)

Required Texts:
• "The Problems of Philosophy" by Bertrand Russell
• Course packet with primary source readings`,
    modules: [
      {
        id: 1,
        name: 'Introduction and Ancient Philosophy',
        description: 'What is philosophy and exploration of ancient Greek thought',
        is_completed: true,
        items: [
          {
            id: 21,
            title: 'Socratic Method Discussion',
            type: 'discussion',
            content: 'Practice the Socratic method by questioning fundamental assumptions about knowledge and reality.',
            due_date: getRelativeDate(-15),
            status: 'graded',
            grade: 95,
            points_possible: 30
          },
          {
            id: 22,
            title: 'Plato\'s Cave Allegory Analysis',
            type: 'assignment',
            content: 'Write a 750-word analysis of Plato\'s Cave Allegory and its relevance to modern media and reality.',
            due_date: getRelativeDate(-10),
            status: 'graded',
            grade: 88,
            feedback: 'Excellent analysis of the allegory\'s modern applications. Consider exploring more contemporary examples.',
            points_possible: 100
          }
        ]
      },
      {
        id: 2,
        name: 'Epistemology: Theory of Knowledge',
        description: 'How do we know what we know?',
        is_completed: false,
        items: [
          {
            id: 23,
            title: 'Skepticism and Certainty Quiz',
            type: 'quiz',
            content: 'Test your understanding of skeptical arguments and responses to skepticism.',
            due_date: getRelativeDate(3),
            status: 'not_started',
            points_possible: 50
          },
          {
            id: 24,
            title: 'Descartes vs. Hume Essay',
            type: 'assignment',
            content: 'Compare and contrast Descartes\' rationalism with Hume\'s empiricism in a 750-word essay.',
            due_date: getRelativeDate(10),
            status: 'not_started',
            points_possible: 100
          }
        ]
      }
    ]
  },

  // Mathematics Course (Jennifer Werner - AI Learning Strategist overseeing)
  {
    id: 3,
    name: 'Calculus I',
    course_code: 'MAT265',
    description: 'Limits, derivatives, and applications of differential calculus. Introduction to integral calculus.',
    instructor: 'Dr. James Wilson',
    instructor_email: 'j.wilson@plato.edu',
    term: 'Summer 2025',
    total_points: 900,
    current_grade: 82,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Mathematics',
    credits: 4,
    prerequisites: ['MAT160 College Algebra', 'MAT170 Precalculus'],
    room_location: 'MATH 315',
    meeting_times: 'MTWF 11:00-11:50 AM',
    syllabus: `Course Description:
This course covers limits, continuity, differentiation, and applications of derivatives. Students will master fundamental concepts of differential calculus and begin integral calculus.

Learning Outcomes:
• Evaluate limits using various techniques
• Apply the definition of derivative and differentiation rules
• Solve optimization and related rate problems
• Use derivatives to analyze function behavior
• Understand the Fundamental Theorem of Calculus

Topics Covered:
• Limits and Continuity
• The Derivative
• Differentiation Rules
• Applications of Derivatives
• Integration Basics

Assessment:
• Homework (15%): Weekly problem sets
• Quizzes (20%): Bi-weekly concept checks
• Exams (45%): 3 midterm exams
• Final Exam (20%): Comprehensive final

Required Materials:
• Stewart's "Calculus: Early Transcendentals" 9th Edition
• WebAssign online homework system
• Graphing calculator (TI-84 or equivalent)`,
    modules: [
      {
        id: 1,
        name: 'Limits and Continuity',
        description: 'Foundation concepts of calculus',
        is_completed: true,
        items: [
          {
            id: 31,
            title: 'Limit Laws and Techniques',
            type: 'page',
            content: 'Master limit evaluation using algebraic manipulation, squeeze theorem, and graphical analysis.',
            due_date: getRelativeDate(-18),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 32,
            title: 'Limits and Continuity Quiz',
            type: 'quiz',
            content: 'Evaluate limits and determine continuity of functions.',
            due_date: getRelativeDate(-12),
            status: 'graded',
            grade: 85,
            feedback: 'Good understanding of limit concepts. Review indeterminate forms.',
            points_possible: 60
          }
        ]
      },
      {
        id: 2,
        name: 'Derivatives',
        description: 'Definition and computation of derivatives',
        is_completed: false,
        items: [
          {
            id: 33,
            title: 'Derivative Rules Assignment',
            type: 'assignment',
            content: 'Apply power rule, product rule, quotient rule, and chain rule to find derivatives.',
            due_date: getRelativeDate(7),
            status: 'in_progress',
            points_possible: 80
          },
          {
            id: 34,
            title: 'Related Rates Problems',
            type: 'assignment',
            content: 'Solve real-world problems involving rates of change.',
            due_date: getRelativeDate(14),
            status: 'not_started',
            points_possible: 100
          }
        ]
      }
    ]
  }
];

// Comprehensive assignment data
const assignments: Assignment[] = [
  // CS380 Assignments
  {
    id: 1,
    name: 'React Component Library',
    description: 'Build a reusable component library with TypeScript, Storybook documentation, and unit tests.',
    due_at: getRelativeDate(-5),
    course_id: 1,
    points_possible: 150,
    submission_type: 'online_text_entry',
    status: 'submitted',
    grade: 142,
    feedback: 'Excellent component design and documentation. Minor improvements needed in test coverage.',
    requirements: [
      'Create at least 8 reusable components',
      'Implement TypeScript interfaces for all props',
      'Include Storybook stories for each component',
      'Achieve 90%+ test coverage with Jest and React Testing Library',
      'Follow accessibility best practices (WCAG 2.1)',
      'Include responsive design patterns'
    ],
    rubric: [
      { criterion: 'Component Design', points: 40, description: 'Well-structured, reusable components' },
      { criterion: 'TypeScript Implementation', points: 30, description: 'Proper type definitions and interfaces' },
      { criterion: 'Documentation', points: 25, description: 'Clear Storybook stories and README' },
      { criterion: 'Testing', points: 35, description: 'Comprehensive unit and integration tests' },
      { criterion: 'Accessibility', points: 20, description: 'WCAG compliance and semantic HTML' }
    ]
  },
  
  {
    id: 2,
    name: 'Full-Stack E-commerce Platform',
    description: 'Build a complete e-commerce platform with product catalog, shopping cart, payment processing, and admin dashboard.',
    due_at: getRelativeDate(12),
    course_id: 1,
    points_possible: 250,
    submission_type: 'online_text_entry',
    status: 'in_progress',
    requirements: [
      'Next.js frontend with App Router',
      'Node.js/Express backend API',
      'PostgreSQL database with Prisma ORM',
      'Stripe payment integration',
      'JWT authentication and authorization',
      'Admin dashboard with analytics',
      'Responsive design for mobile and desktop',
      'Docker containerization',
      'Deployment to cloud platform'
    ],
    rubric: [
      { criterion: 'Frontend Implementation', points: 60, description: 'React/Next.js best practices and UX' },
      { criterion: 'Backend Architecture', points: 50, description: 'API design and database integration' },
      { criterion: 'Authentication & Security', points: 40, description: 'Secure user management and data protection' },
      { criterion: 'Payment Integration', points: 30, description: 'Functional Stripe payment flow' },
      { criterion: 'Code Quality', points: 35, description: 'Clean code, documentation, and testing' },
      { criterion: 'Deployment', points: 35, description: 'Successful cloud deployment with CI/CD' }
    ]
  },

  // PHI101 Assignments
  {
    id: 3,
    name: 'The Ship of Theseus: Personal Identity Essay',
    description: 'Analyze the philosophical problem of personal identity using the Ship of Theseus paradox and modern theories.',
    due_at: getRelativeDate(8),
    course_id: 2,
    points_possible: 100,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      '750-1000 words in length',
      'Clear thesis statement and argument structure',
      'Engage with at least 3 philosophical theories',
      'Use specific examples and thought experiments',
      'Proper citations in MLA format',
      'Original critical analysis and evaluation'
    ],
    rubric: [
      { criterion: 'Thesis and Argument', points: 30, description: 'Clear, well-supported central argument' },
      { criterion: 'Philosophical Understanding', points: 25, description: 'Accurate representation of theories' },
      { criterion: 'Critical Analysis', points: 25, description: 'Original evaluation and insight' },
      { criterion: 'Writing Quality', points: 15, description: 'Clear prose and proper grammar' },
      { criterion: 'Citations', points: 5, description: 'Proper MLA format and sources' }
    ]
  },

  {
    id: 4,
    name: 'Ethical Dilemma Case Study',
    description: 'Apply major ethical theories (utilitarianism, deontology, virtue ethics) to a contemporary moral dilemma.',
    due_at: getRelativeDate(22),
    course_id: 2,
    points_possible: 100,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Choose a current ethical dilemma from provided list',
      'Apply three major ethical frameworks',
      'Compare and contrast the different approaches',
      '800-1000 words in length',
      'Include real-world implications and stakeholder analysis'
    ]
  },

  // MAT265 Assignments
  {
    id: 5,
    name: 'Optimization Problems Project',
    description: 'Solve real-world optimization problems using calculus techniques and provide written explanations.',
    due_at: getRelativeDate(16),
    course_id: 3,
    points_possible: 120,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Solve 6 optimization problems from different domains',
      'Show all work with clear mathematical notation',
      'Provide written explanation of solution process',
      'Include graphical representations where appropriate',
      'Verify solutions using technology (graphing calculator/software)'
    ],
    rubric: [
      { criterion: 'Problem Setup', points: 30, description: 'Correct identification of variables and constraints' },
      { criterion: 'Mathematical Work', points: 50, description: 'Accurate calculus techniques and algebra' },
      { criterion: 'Solutions and Verification', points: 25, description: 'Correct answers with verification' },
      { criterion: 'Communication', points: 15, description: 'Clear explanations and mathematical notation' }
    ]
  },

  {
    id: 6,
    name: 'Calculus Concepts Quiz Series',
    description: 'Weekly online quizzes testing fundamental calculus concepts and problem-solving skills.',
    due_at: getRelativeDate(5),
    course_id: 3,
    points_possible: 80,
    submission_type: 'online_quiz',
    status: 'not_started',
    quiz_details: {
      time_limit: 60,
      allowed_attempts: 2,
      questions: [
        {
          id: 1,
          question: 'Find the derivative of f(x) = x³ + 2x² - 5x + 7',
          type: 'multiple_choice',
          options: ['3x² + 4x - 5', '3x² + 2x - 5', 'x² + 4x - 5', '3x² + 4x + 7'],
          correct_answer: 0,
          points: 10,
          explanation: 'Using the power rule: d/dx(x³) = 3x², d/dx(2x²) = 4x, d/dx(-5x) = -5, d/dx(7) = 0'
        },
        {
          id: 2,
          question: 'What is lim(x→2) (x² - 4)/(x - 2)?',
          type: 'multiple_choice',
          options: ['0', '2', '4', 'undefined'],
          correct_answer: 2,
          points: 10,
          explanation: 'Factor the numerator: (x² - 4) = (x-2)(x+2), so the limit becomes lim(x→2) (x+2) = 4'
        }
      ]
    }
  }
];

// Enhanced calendar events with proper scheduling
const calendarEvents: CalendarEvent[] = [
  // CS380 Events
  {
    id: 1,
    title: 'React Hooks Workshop',
    type: 'lecture',
    start_date: getRelativeDate(1),
    end_date: getRelativeDate(1),
    start_time: '10:00 AM',
    end_time: '10:50 AM',
    course_id: 1,
    course_name: 'Advanced Web Development',
    status: 'upcoming',
    location: 'ENGR 205',
    description: 'Interactive workshop on advanced React hooks patterns and custom hook development.'
  },
  
  {
    id: 2,
    title: 'Database Design Discussion Due',
    type: 'discussion',
    start_date: getRelativeDate(4),
    end_date: getRelativeDate(4),
    start_time: '11:59 PM',
    course_id: 1,
    course_name: 'Advanced Web Development',
    status: 'upcoming',
    points_possible: 25,
    priority: 'medium',
    description: 'Share your database design choices and discuss normalization strategies.'
  },

  {
    id: 3,
    title: 'REST API Development Project Due',
    type: 'assignment',
    start_date: getRelativeDate(6),
    end_date: getRelativeDate(6),
    start_time: '11:59 PM',
    course_id: 1,
    course_name: 'Advanced Web Development',
    status: 'upcoming',
    points_possible: 150,
    priority: 'high',
    description: 'Submit your complete REST API with documentation and test suite.'
  },

  // PHI101 Events
  {
    id: 4,
    title: 'Socratic Seminar: Free Will vs. Determinism',
    type: 'lecture',
    start_date: getRelativeDate(2),
    end_date: getRelativeDate(2),
    start_time: '9:30 AM',
    end_time: '10:45 AM',
    course_id: 2,
    course_name: 'Introduction to Philosophy',
    status: 'upcoming',
    location: 'PHIL 120',
    description: 'Student-led discussion on the compatibility of free will and determinism.'
  },

  {
    id: 5,
    title: 'Personal Identity Essay Due',
    type: 'assignment',
    start_date: getRelativeDate(8),
    end_date: getRelativeDate(8),
    start_time: '11:59 PM',
    course_id: 2,
    course_name: 'Introduction to Philosophy',
    status: 'upcoming',
    points_possible: 100,
    priority: 'high',
    description: 'Submit your analysis of personal identity using the Ship of Theseus paradox.'
  },

  // MAT265 Events
  {
    id: 6,
    title: 'Derivative Applications Lecture',
    type: 'lecture',
    start_date: getRelativeDate(1),
    end_date: getRelativeDate(1),
    start_time: '11:00 AM',
    end_time: '11:50 AM',
    course_id: 3,
    course_name: 'Calculus I',
    status: 'upcoming',
    location: 'MATH 315',
    description: 'Learn to apply derivatives to solve optimization and related rate problems.'
  },

  {
    id: 7,
    title: 'Calculus Quiz: Derivatives',
    type: 'quiz',
    start_date: getRelativeDate(5),
    end_date: getRelativeDate(5),
    start_time: '11:00 AM',
    end_time: '11:30 AM',
    course_id: 3,
    course_name: 'Calculus I',
    status: 'upcoming',
    points_possible: 80,
    priority: 'medium',
    location: 'MATH 315',
    description: 'Timed quiz covering differentiation rules and applications.'
  },

  // Office Hours
  {
    id: 8,
    title: 'Dr. Martinez Office Hours',
    type: 'office_hours',
    start_date: getRelativeDate(1),
    end_date: getRelativeDate(1),
    start_time: '2:00 PM',
    end_time: '4:00 PM',
    course_id: 1,
    course_name: 'Advanced Web Development',
    status: 'upcoming',
    location: 'ENGR 210',
    description: 'Drop-in office hours for questions about web development and philosophy courses.'
  }
];

// Export mock API functions (to be continued in next part due to length)
export const mockCanvasApi = {
  // Course operations
  async getCourses(userEnrollments?: string[]): Promise<Course[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    if (!userEnrollments || userEnrollments.length === 0) {
      return courses;
    }
    
    // Filter courses based on user enrollments
    const enrollmentIds = userEnrollments.map(id => parseInt(id, 10));
    return courses.filter(course => enrollmentIds.includes(course.id));
  },

  async getCourse(courseId: number): Promise<Course | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return courses.find(course => course.id === courseId) || null;
  },

  // Assignment operations
  async getAssignments(courseIds?: number[]): Promise<Assignment[]> {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    if (!courseIds || courseIds.length === 0) {
      return assignments;
    }
    
    return assignments.filter(assignment => courseIds.includes(assignment.course_id));
  },

  async getAssignment(assignmentId: number): Promise<Assignment | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return assignments.find(assignment => assignment.id === assignmentId) || null;
  },

  // Calendar operations
  async getCalendarEvents(startDate: string, endDate: string, userEnrollments?: string[]): Promise<CalendarEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let filteredEvents = calendarEvents.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= start && eventDate <= end;
    });

    // Filter by user enrollments if provided
    if (userEnrollments && userEnrollments.length > 0) {
      const enrollmentIds = userEnrollments.map(id => parseInt(id, 10));
      filteredEvents = filteredEvents.filter(event => enrollmentIds.includes(event.course_id));
    }

    return filteredEvents;
  }
}; 