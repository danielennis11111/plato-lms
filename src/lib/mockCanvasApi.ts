import { addDays, addWeeks, format, startOfMonth, subDays, subWeeks, addMonths } from 'date-fns';
import { slugify } from '@/lib/utils';
import { generatePopularMusicPianoCourse } from './comprehensiveMusicCourseGenerator';

// ASU Photo Utility - Generate profile photo URLs using ASURITE
export function getASUPhotoUrl(asurite: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const timestamp = Date.now();
  return `https://webapp4.asu.edu/photo-ws/directory_photo/${asurite}?size=${size}&break=${timestamp}&blankImage2=1`;
}

// Current date reference: June 4, 2025
const TODAY = new Date('2025-06-04');

// Helper function to generate realistic dates relative to June 4, 2025
function getRelativeDate(daysFromToday: number): string {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString();
}

// Interfaces
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
  type: 'assignment' | 'discussion' | 'quiz' | 'page' | 'reading';
  content?: string;
  due_date?: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  points_possible?: number;
  submissions?: number;
  attempts?: number;
  max_attempts?: number;
  reading_details?: {
    source: string;
    pages?: string;
    url?: string;
    estimated_time: number; // minutes
    type: 'textbook' | 'article' | 'website' | 'video' | 'research_paper' | 'enhanced_reading';
    youtube_videos?: Array<{
      title: string;
      videoId: string;
      description: string;
      duration: string;
    }>;
    key_points?: string[];
    further_reading?: string[];
  };
  quiz_details?: {
    time_limit: number;
    allowed_attempts: number;
    questions: any[];
    instructions?: string;
    passing_score?: number;
  };
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

export interface CourseAnalytics {
  course_id: number;
  course_name: string;
  enrollment_count: number;
  active_students: number;
  average_grade: number;
  completion_rate: number;
  discussion_engagement: number;
  assignment_submission_rate: number;
  ai_detection_flags: number;
  weekly_activity: number[];
  grade_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  risk_factors: string[];
  recommendations: string[];
  student_performance: Array<{
    id: number;
    name: string;
    current_grade: number;
    at_risk: boolean;
    last_activity: string;
  }>;
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
    term: 'Spring 2025',
    total_points: 1620,
    current_grade: 87,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Computer Science',
    credits: 4,
    prerequisites: ['CS250 Data Structures', 'CS270 Web Fundamentals'],
    room_location: 'ENGR 205',
    meeting_times: 'MWF 10:00-10:50 AM, Lab: T 2:00-4:50 PM',
    syllabus: `# Advanced Web Development (CS380)
**Instructor:** Dr. Sarah Martinez
**Email:** faculty@plato.edu  
**Term:** Summer 2025
**Credits:** 4
**Meeting Times:** MWF 10:00-10:50 AM, Lab: T 2:00-4:50 PM
**Location:** ENGR 205

## Course Overview
This advanced computer science course focuses on Master modern web development with React, Next.js, Node.js, and cloud deployment. Build full-stack applications using TypeScript, database integration, authentication, and real-time features.. Students will engage in hands-on programming projects, theoretical problem-solving, and collaborative software development practices that mirror industry standards.

## Learning Objectives
By the end of this course, students will be able to:
• Apply computational thinking to solve complex problems
• Implement efficient algorithms and data structures
• Write clean, well-documented, and maintainable code
• Use version control and collaborative development tools
• Understand software engineering best practices
• Debug and test software systematically
• Analyze algorithmic complexity and performance
• Design scalable software architectures
• Apply advanced programming patterns and paradigms

## Assessment Breakdown
**Programming Assignments (40%):** 6-8 coding projects increasing in complexity
**Quizzes & Labs (20%):** Weekly coding exercises and concept assessments
**Midterm Project (20%):** Comprehensive application demonstrating course concepts
**Final Project (20%):** Original software project with documentation and presentation

## Course Schedule
Classes meet MWF 10:00-10:50 AM, Lab: T 2:00-4:50 PM. Each session includes lecture, hands-on coding, and collaborative problem-solving.

## Required Materials
• Laptop with development environment setup
• Course-specific IDE or text editor (instructions provided)
• GitHub account for version control
• Access to online coding platforms and resources

## Course Policies

### Attendance Policy
Regular attendance is essential due to hands-on nature of coursework. Missing more than 3 classes may result in course withdrawal recommendation.

### Late Work Policy  
Programming assignments lose 10% per day late. Extensions granted for documented emergencies only.

### Academic Integrity
Collaboration encouraged on learning, but all submitted code must be your own work. Plagiarism detection software used.

### Accessibility Statement
Students with disabilities should contact Disability Resources Center. All course materials available in alternative formats upon request.

## Weekly Course Schedule


**Week 1: Course Introduction**
- Learning Goals: Course overview, Tool setup
- Activities: Environment setup, Initial coding
- Assessments: Setup verification


**Week 2: Fundamentals**
- Learning Goals: Core concepts, Basic implementation
- Activities: Practice exercises, Code review
- Assessments: Fundamentals quiz


**Week 3: Advanced Concepts**
- Learning Goals: Complex topics, Real applications
- Activities: Project work, Case studies
- Assessments: Project milestone

---
*This syllabus is subject to change. Students will be notified of any modifications.*`,
    modules: [
      {
        id: 1,
        name: 'Module 1: Modern React Fundamentals',
        description: 'Deep dive into React hooks, context, and modern development patterns',
        is_completed: true,
        due_date: getRelativeDate(-85),
        items: [
          {
            id: 101,
            title: 'Introduction to Modern React Fundamentals',
            type: 'page',
            content: '<h2>Welcome to Modern React Fundamentals</h2><p>Master React hooks, context, and modern development patterns including performance optimization and advanced state management.</p><h3>Learning Objectives</h3><ul><li>Master fundamental React concepts</li><li>Apply hooks and modern patterns</li><li>Develop component architecture skills</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-85),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 102,
            title: 'React Hooks and Modern Patterns - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering React hooks and modern development patterns',
            due_date: getRelativeDate(-83),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'React Official Documentation',
              pages: '65-85',
              estimated_time: 60,
              type: 'website'
            }
          },
          {
            id: 103,
            title: 'Discussion: Best Practices in React Development',
            type: 'discussion',
            content: 'Discuss modern react fundamentals and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-81),
            status: 'graded',
            points_possible: 25
          },
          {
            id: 104,
            title: 'Advanced React Patterns - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for modern react fundamentals',
            due_date: getRelativeDate(-78),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '85-105',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 105,
            title: 'Modern React Fundamentals Programming Project',
            type: 'assignment',
            content: 'Complete this programming project demonstrating understanding of modern react fundamentals. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-75),
            status: 'graded',
            grade: 92,
            feedback: 'Excellent implementation of React hooks and modern patterns!',
            points_possible: 105,
            max_attempts: 3,
            submissions: 1,
            attempts: 1
          },
          {
            id: 106,
            title: 'Modern React Fundamentals Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering modern react fundamentals',
            due_date: getRelativeDate(-72),
            status: 'graded',
            grade: 88,
            points_possible: 50,
            max_attempts: 2,
            attempts: 1
          }
        ]
      },
      {
        id: 2,
        name: 'Module 2: State Management Systems',
        description: 'Redux, Zustand, and advanced state management techniques',
        is_completed: true,
        due_date: getRelativeDate(-71),
        items: [
          {
            id: 201,
            title: 'Introduction to State Management Systems',
            type: 'page',
            content: '<h2>Welcome to State Management Systems</h2><p>Redux, Zustand, and advanced state management techniques for scalable applications.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-71),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 202,
            title: 'State Management - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering state management systems',
            due_date: getRelativeDate(-69),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '85-105',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 203,
            title: 'Discussion: Technology Trends in State Management',
            type: 'discussion',
            content: 'Discuss state management systems and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-67),
            status: 'graded',
            points_possible: 25
          },
          {
            id: 204,
            title: 'Advanced State Management - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for state management systems',
            due_date: getRelativeDate(-64),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '105-125',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 205,
            title: 'State Management Systems Code Review',
            type: 'assignment',
            content: 'Complete this code review demonstrating understanding of state management systems. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-61),
            status: 'graded',
            grade: 90,
            points_possible: 110,
            max_attempts: 3,
            submissions: 1,
            attempts: 1
          },
          {
            id: 206,
            title: 'State Management Systems Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering state management systems',
            due_date: getRelativeDate(-58),
            status: 'graded',
            grade: 85,
            points_possible: 50,
            max_attempts: 2,
            attempts: 1
          }
        ]
      },
      {
        id: 3,
        name: 'Module 3: Backend Integration',
        description: 'API design, authentication, and full-stack development',
        is_completed: true,
        due_date: getRelativeDate(-57),
        items: [
          {
            id: 301,
            title: 'Introduction to Backend Integration',
            type: 'page',
            content: '<h2>Welcome to Backend Integration</h2><p>API design, authentication, and full-stack development fundamentals.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-57),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 302,
            title: 'Backend Integration - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering backend integration',
            due_date: getRelativeDate(-55),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '125-145',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 303,
            title: 'Discussion: Code Architecture in Full-Stack Development',
            type: 'discussion',
            content: 'Discuss backend integration and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-53),
            status: 'graded',
            points_possible: 25
          },
          {
            id: 304,
            title: 'API Design and Authentication - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for backend integration',
            due_date: getRelativeDate(-50),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '145-165',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 305,
            title: 'Backend Integration System Design',
            type: 'assignment',
            content: 'Complete this system design demonstrating understanding of backend integration. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-47),
            status: 'graded',
            grade: 94,
            points_possible: 115,
            max_attempts: 3,
            submissions: 1,
            attempts: 1
          },
          {
            id: 306,
            title: 'Backend Integration Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering backend integration',
            due_date: getRelativeDate(-44),
            status: 'graded',
            grade: 91,
            points_possible: 50,
            max_attempts: 2,
            attempts: 1
          }
        ]
      },
      {
        id: 4,
        name: 'Module 4: Performance Optimization',
        description: 'Code splitting, lazy loading, and performance monitoring',
        is_completed: false,
        due_date: getRelativeDate(-43),
        items: [
          {
            id: 401,
            title: 'Introduction to Performance Optimization',
            type: 'page',
            content: '<h2>Welcome to Performance Optimization</h2><p>Code splitting, lazy loading, and performance monitoring techniques.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-43),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 402,
            title: 'Performance Optimization - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering performance optimization',
            due_date: getRelativeDate(-41),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '165-185',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 403,
            title: 'Discussion: Best Practices in Performance',
            type: 'discussion',
            content: 'Discuss performance optimization and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-39),
            status: 'submitted',
            points_possible: 25
          },
          {
            id: 404,
            title: 'Advanced Performance Techniques - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for performance optimization',
            due_date: getRelativeDate(-36),
            status: 'in_progress',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '185-205',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 405,
            title: 'Performance Optimization Programming Project',
            type: 'assignment',
            content: 'Complete this programming project demonstrating understanding of performance optimization. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-33),
            status: 'not_started',
            points_possible: 120,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 406,
            title: 'Performance Optimization Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering performance optimization',
            due_date: getRelativeDate(-30),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      },
      {
        id: 5,
        name: 'Module 5: Testing Strategies',
        description: 'Unit testing, integration testing, and E2E testing',
        is_completed: false,
        due_date: getRelativeDate(-29),
        items: [
          {
            id: 501,
            title: 'Introduction to Testing Strategies',
            type: 'page',
            content: '<h2>Welcome to Testing Strategies</h2><p>Unit testing, integration testing, and E2E testing methodologies.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-29),
            status: 'not_started',
            points_possible: 0
          },
          {
            id: 502,
            title: 'Testing Strategies - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering testing strategies',
            due_date: getRelativeDate(-27),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '205-225',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 503,
            title: 'Discussion: Technology Trends in Testing',
            type: 'discussion',
            content: 'Discuss testing strategies and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-25),
            status: 'not_started',
            points_possible: 25
          },
          {
            id: 504,
            title: 'Advanced Testing Methodologies - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for testing strategies',
            due_date: getRelativeDate(-22),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '225-245',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 505,
            title: 'Testing Strategies Code Review',
            type: 'assignment',
            content: 'Complete this code review demonstrating understanding of testing strategies. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-19),
            status: 'not_started',
            points_possible: 125,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 506,
            title: 'Testing Strategies Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering testing strategies',
            due_date: getRelativeDate(-16),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      },
      {
        id: 6,
        name: 'Module 6: Deployment & DevOps',
        description: 'CI/CD pipelines, containerization, and cloud deployment',
        is_completed: false,
        due_date: getRelativeDate(-15),
        items: [
          {
            id: 601,
            title: 'Introduction to Deployment & DevOps',
            type: 'page',
            content: '<h2>Welcome to Deployment & DevOps</h2><p>CI/CD pipelines, containerization, and cloud deployment strategies.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-15),
            status: 'not_started',
            points_possible: 0
          },
          {
            id: 602,
            title: 'Deployment & DevOps - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering deployment & devops',
            due_date: getRelativeDate(-13),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '245-265',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 603,
            title: 'Discussion: Code Architecture in DevOps',
            type: 'discussion',
            content: 'Discuss deployment & devops and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-11),
            status: 'not_started',
            points_possible: 25
          },
          {
            id: 604,
            title: 'Advanced DevOps Practices - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for deployment & devops',
            due_date: getRelativeDate(-8),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '265-285',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 605,
            title: 'Deployment & DevOps System Design',
            type: 'assignment',
            content: 'Complete this system design demonstrating understanding of deployment & devops. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-5),
            status: 'not_started',
            points_possible: 130,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 606,
            title: 'Deployment & DevOps Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering deployment & devops',
            due_date: getRelativeDate(-2),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      },
      {
        id: 7,
        name: 'Module 7: Advanced Patterns',
        description: 'Design patterns, architecture, and scalability',
        is_completed: false,
        due_date: getRelativeDate(-1),
        items: [
          {
            id: 701,
            title: 'Introduction to Advanced Patterns',
            type: 'page',
            content: '<h2>Welcome to Advanced Patterns</h2><p>Design patterns, architecture, and scalability principles for enterprise applications.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-1),
            status: 'not_started',
            points_possible: 0
          },
          {
            id: 702,
            title: 'Advanced Patterns - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering advanced patterns',
            due_date: getRelativeDate(1),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '285-305',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 703,
            title: 'Discussion: Best Practices in Architecture',
            type: 'discussion',
            content: 'Discuss advanced patterns and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(3),
            status: 'not_started',
            points_possible: 25
          },
          {
            id: 704,
            title: 'Scalable Architecture Patterns - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for advanced patterns',
            due_date: getRelativeDate(6),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '305-325',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 705,
            title: 'Advanced Patterns Programming Project',
            type: 'assignment',
            content: 'Complete this programming project demonstrating understanding of advanced patterns. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(9),
            status: 'not_started',
            points_possible: 135,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 706,
            title: 'Advanced Patterns Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering advanced patterns',
            due_date: getRelativeDate(12),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      },
      {
        id: 8,
        name: 'Module 8: Capstone Project',
        description: 'Comprehensive full-stack application development',
        is_completed: false,
        due_date: getRelativeDate(13),
        items: [
          {
            id: 801,
            title: 'Introduction to Capstone Project',
            type: 'page',
            content: '<h2>Welcome to Capstone Project</h2><p>Comprehensive full-stack application development demonstrating all course concepts.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(13),
            status: 'not_started',
            points_possible: 0
          },
          {
            id: 802,
            title: 'Capstone Project - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering capstone project requirements',
            due_date: getRelativeDate(15),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '325-345',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 803,
            title: 'Discussion: Project Planning and Architecture',
            type: 'discussion',
            content: 'Discuss capstone project plans and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(17),
            status: 'not_started',
            points_possible: 25
          },
          {
            id: 804,
            title: 'Full-Stack Development Best Practices - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for capstone project development',
            due_date: getRelativeDate(20),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '345-365',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 805,
            title: 'Capstone Project Programming Project',
            type: 'assignment',
            content: 'Complete this programming project demonstrating understanding of all course concepts. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(23),
            status: 'not_started',
            points_possible: 140,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 806,
            title: 'Capstone Project Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering the entire course through capstone demonstration',
            due_date: getRelativeDate(26),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      }
    ]
  },

  // Philosophy Course (Dr. Sarah Martinez)
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

Major Topics:
Week 1-2: What is Philosophy? Ancient Greek Foundations
Week 3-4: Theory of Knowledge (Epistemology)
Week 5-6: Metaphysics and Reality
Week 7-8: Ethics and Moral Philosophy
Week 9-10: Political Philosophy and Justice
Week 11-12: Philosophy of Mind and Personal Identity

Assessment:
• Participation and Discussion (20%)
• Short Papers (30%): 3 papers, 750 words each
• Midterm Exam (25%)
• Final Exam (25%)`,
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

Assessment:
• Homework (15%): Weekly problem sets
• Quizzes (20%): Bi-weekly concept checks
• Exams (45%): 3 midterm exams
• Final Exam (20%): Comprehensive final`,
    modules: [
      {
        id: 1,
        name: 'Module 1: Limits and Continuity',
        description: 'Introduction to limits, limit laws, and continuity of functions',
        is_completed: true,
        due_date: getRelativeDate(-85),
        items: [
          {
            id: 301,
            title: 'Introduction to Limits and Continuity',
            type: 'page',
            content: '<h2>Welcome to Limits and Continuity</h2><p>Introduction to limits, limit laws, and continuity of functions - the foundation of calculus.</p><h3>Learning Objectives</h3><ul><li>Master fundamental limit concepts</li><li>Apply limit laws and techniques</li><li>Understand continuity and discontinuity</li><li>Solve real-world limit problems</li></ul>',
            due_date: getRelativeDate(-85),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 302,
            title: 'Limits and Continuity - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering limits and continuity concepts',
            due_date: getRelativeDate(-83),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Calculus: Early Transcendentals',
              pages: '65-85',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 303,
            title: 'Discussion: Mathematical Concepts in Limits',
            type: 'discussion',
            content: 'Discuss limits and continuity concepts and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-81),
            status: 'graded',
            points_possible: 25
          },
          {
            id: 304,
            title: 'Advanced Limit Techniques - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for limits and continuity',
            due_date: getRelativeDate(-78),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '85-105',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 305,
            title: 'Limits and Continuity Problem Set',
            type: 'assignment',
            content: 'Complete this problem set demonstrating understanding of limits and continuity. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-75),
            status: 'graded',
            grade: 88,
            feedback: 'Excellent work on limit calculations. Strong understanding of continuity concepts.',
            points_possible: 80,
            max_attempts: 3,
            submissions: 1,
            attempts: 1
          },
          {
            id: 306,
            title: 'Limits and Continuity Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering limits and continuity',
            due_date: getRelativeDate(-72),
            status: 'graded',
            grade: 85,
            points_possible: 50,
            max_attempts: 2,
            attempts: 1
          }
        ]
      },
      {
        id: 2,
        name: 'Module 2: Derivatives and Rules',
        description: 'Definition of derivatives and fundamental differentiation rules',
        is_completed: true,
        due_date: getRelativeDate(-71),
        items: [
          {
            id: 401,
            title: 'Introduction to Derivatives and Rules',
            type: 'page',
            content: '<h2>Welcome to Derivatives and Rules</h2><p>Definition of derivatives and fundamental differentiation rules for polynomial, exponential, and trigonometric functions.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-71),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 402,
            title: 'Derivatives and Rules - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering derivatives and rules',
            due_date: getRelativeDate(-69),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '85-105',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 403,
            title: 'Discussion: Real-world Applications of Derivatives',
            type: 'discussion',
            content: 'Discuss derivatives and rules and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-67),
            status: 'graded',
            points_possible: 25
          },
          {
            id: 404,
            title: 'Advanced Differentiation Techniques - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for derivatives and rules',
            due_date: getRelativeDate(-64),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '105-125',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 405,
            title: 'Derivatives and Rules Proof Assignment',
            type: 'assignment',
            content: 'Complete this proof assignment demonstrating understanding of derivatives and rules. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-61),
            status: 'graded',
            grade: 82,
            points_possible: 85,
            max_attempts: 3,
            submissions: 1,
            attempts: 1
          },
          {
            id: 406,
            title: 'Derivatives and Rules Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering derivatives and rules',
            due_date: getRelativeDate(-58),
            status: 'graded',
            grade: 90,
            points_possible: 50,
            max_attempts: 2,
            attempts: 1
          }
        ]
      },
      {
        id: 3,
        name: 'Module 3: Applications of Derivatives',
        description: 'Related rates, optimization, and curve sketching',
        is_completed: true,
        due_date: getRelativeDate(-57),
        items: [
          {
            id: 501,
            title: 'Introduction to Applications of Derivatives',
            type: 'page',
            content: '<h2>Welcome to Applications of Derivatives</h2><p>Related rates, optimization, and curve sketching using derivative techniques.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-57),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 502,
            title: 'Applications of Derivatives - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering applications of derivatives',
            due_date: getRelativeDate(-55),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '125-145',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 503,
            title: 'Discussion: Problem Solving Strategies with Derivatives',
            type: 'discussion',
            content: 'Discuss applications of derivatives and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-53),
            status: 'graded',
            points_possible: 25
          },
          {
            id: 504,
            title: 'Optimization and Related Rates - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for applications of derivatives',
            due_date: getRelativeDate(-50),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '145-165',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 505,
            title: 'Applications of Derivatives Mathematical Modeling',
            type: 'assignment',
            content: 'Complete this mathematical modeling demonstrating understanding of applications of derivatives. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-47),
            status: 'graded',
            grade: 91,
            points_possible: 90,
            max_attempts: 3,
            submissions: 1,
            attempts: 1
          },
          {
            id: 506,
            title: 'Applications of Derivatives Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering applications of derivatives',
            due_date: getRelativeDate(-44),
            status: 'graded',
            grade: 87,
            points_possible: 50,
            max_attempts: 2,
            attempts: 1
          }
        ]
      },
      {
        id: 4,
        name: 'Module 4: The Integral',
        description: 'Antiderivatives and the fundamental theorem of calculus',
        is_completed: false,
        due_date: getRelativeDate(-43),
        items: [
          {
            id: 601,
            title: 'Introduction to The Integral',
            type: 'page',
            content: '<h2>Welcome to The Integral</h2><p>Antiderivatives and the fundamental theorem of calculus - connecting differentiation and integration.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-43),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 602,
            title: 'The Integral - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering the integral',
            due_date: getRelativeDate(-41),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '165-185',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 603,
            title: 'Discussion: Mathematical Concepts in Integration',
            type: 'discussion',
            content: 'Discuss the integral and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-39),
            status: 'submitted',
            points_possible: 25
          },
          {
            id: 604,
            title: 'Fundamental Theorem of Calculus - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for the integral',
            due_date: getRelativeDate(-36),
            status: 'in_progress',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '185-205',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 605,
            title: 'The Integral Problem Set',
            type: 'assignment',
            content: 'Complete this problem set demonstrating understanding of the integral. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-33),
            status: 'not_started',
            points_possible: 95,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 606,
            title: 'The Integral Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering the integral',
            due_date: getRelativeDate(-30),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      },
      {
        id: 5,
        name: 'Module 5: Integration Techniques',
        description: 'Substitution, integration by parts, and special techniques',
        is_completed: false,
        due_date: getRelativeDate(-29),
        items: [
          {
            id: 701,
            title: 'Introduction to Integration Techniques',
            type: 'page',
            content: '<h2>Welcome to Integration Techniques</h2><p>Substitution, integration by parts, and special techniques for complex integrals.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-29),
            status: 'not_started',
            points_possible: 0
          },
          {
            id: 702,
            title: 'Integration Techniques - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering integration techniques',
            due_date: getRelativeDate(-27),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '205-225',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 703,
            title: 'Discussion: Problem Solving Strategies in Integration',
            type: 'discussion',
            content: 'Discuss integration techniques and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-25),
            status: 'not_started',
            points_possible: 25
          },
          {
            id: 704,
            title: 'Advanced Integration Methods - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for integration techniques',
            due_date: getRelativeDate(-22),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '225-245',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 705,
            title: 'Integration Techniques Proof Assignment',
            type: 'assignment',
            content: 'Complete this proof assignment demonstrating understanding of integration techniques. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-19),
            status: 'not_started',
            points_possible: 100,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 706,
            title: 'Integration Techniques Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering integration techniques',
            due_date: getRelativeDate(-16),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      },
      {
        id: 6,
        name: 'Module 6: Applications of Integration',
        description: 'Area, volume, and physical applications of integrals',
        is_completed: false,
        due_date: getRelativeDate(-15),
        items: [
          {
            id: 801,
            title: 'Introduction to Applications of Integration',
            type: 'page',
            content: '<h2>Welcome to Applications of Integration</h2><p>Area, volume, and physical applications of integrals in real-world contexts.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-15),
            status: 'not_started',
            points_possible: 0
          },
          {
            id: 802,
            title: 'Applications of Integration - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering applications of integration',
            due_date: getRelativeDate(-13),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '245-265',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 803,
            title: 'Discussion: Real-world Applications of Integration',
            type: 'discussion',
            content: 'Discuss applications of integration and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(-11),
            status: 'not_started',
            points_possible: 25
          },
          {
            id: 804,
            title: 'Physics and Engineering Applications - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for applications of integration',
            due_date: getRelativeDate(-8),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '265-285',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 805,
            title: 'Applications of Integration Mathematical Modeling',
            type: 'assignment',
            content: 'Complete this mathematical modeling demonstrating understanding of applications of integration. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(-5),
            status: 'not_started',
            points_possible: 105,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 806,
            title: 'Applications of Integration Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering applications of integration',
            due_date: getRelativeDate(-2),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      },
      {
        id: 7,
        name: 'Module 7: Differential Equations',
        description: 'Basic differential equations and their applications',
        is_completed: false,
        due_date: getRelativeDate(-1),
        items: [
          {
            id: 901,
            title: 'Introduction to Differential Equations',
            type: 'page',
            content: '<h2>Welcome to Differential Equations</h2><p>Basic differential equations and their applications in science and engineering.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(-1),
            status: 'not_started',
            points_possible: 0
          },
          {
            id: 902,
            title: 'Differential Equations - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering differential equations',
            due_date: getRelativeDate(1),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '285-305',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 903,
            title: 'Discussion: Mathematical Concepts in Differential Equations',
            type: 'discussion',
            content: 'Discuss differential equations and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(3),
            status: 'not_started',
            points_possible: 25
          },
          {
            id: 904,
            title: 'Solving Differential Equations - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for differential equations',
            due_date: getRelativeDate(6),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '305-325',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 905,
            title: 'Differential Equations Problem Set',
            type: 'assignment',
            content: 'Complete this problem set demonstrating understanding of differential equations. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(9),
            status: 'not_started',
            points_possible: 110,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 906,
            title: 'Differential Equations Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering differential equations',
            due_date: getRelativeDate(12),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      },
      {
        id: 8,
        name: 'Module 8: Sequences and Series',
        description: 'Infinite sequences, series, and convergence tests',
        is_completed: false,
        due_date: getRelativeDate(13),
        items: [
          {
            id: 1001,
            title: 'Introduction to Sequences and Series',
            type: 'page',
            content: '<h2>Welcome to Sequences and Series</h2><p>Infinite sequences, series, and convergence tests for advanced calculus applications.</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>',
            due_date: getRelativeDate(13),
            status: 'not_started',
            points_possible: 0
          },
          {
            id: 1002,
            title: 'Sequences and Series - Essential Reading',
            type: 'reading',
            content: 'Read foundational materials covering sequences and series',
            due_date: getRelativeDate(15),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Course Textbook',
              pages: '325-345',
              estimated_time: 60,
              type: 'textbook'
            }
          },
          {
            id: 1003,
            title: 'Discussion: Problem Solving Strategies with Series',
            type: 'discussion',
            content: 'Discuss sequences and series and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials',
            due_date: getRelativeDate(17),
            status: 'not_started',
            points_possible: 25
          },
          {
            id: 1004,
            title: 'Convergence Tests and Applications - Advanced Reading',
            type: 'reading',
            content: 'Advanced materials for sequences and series',
            due_date: getRelativeDate(20),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              source: 'Supplementary Materials',
              pages: '345-365',
              estimated_time: 45,
              type: 'article'
            }
          },
          {
            id: 1005,
            title: 'Sequences and Series Proof Assignment',
            type: 'assignment',
            content: 'Complete this proof assignment demonstrating understanding of sequences and series. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date',
            due_date: getRelativeDate(23),
            status: 'not_started',
            points_possible: 115,
            max_attempts: 3,
            submissions: 0,
            attempts: 0
          },
          {
            id: 1006,
            title: 'Sequences and Series Assessment',
            type: 'quiz',
            content: 'Comprehensive assessment covering sequences and series',
            due_date: getRelativeDate(26),
            status: 'not_started',
            points_possible: 50,
            max_attempts: 2,
            attempts: 0
          }
        ]
      }
    ]
  },

  // English Literature Course (Dr. Emily Watson)
  {
    id: 4,
    name: 'Introduction to Literature',
    course_code: 'ENG101',
    description: 'Explore fundamental literary genres, critical reading strategies, and analytical writing through diverse texts from various cultural traditions and historical periods.',
    instructor: 'Dr. Emily Watson',
    instructor_email: 'e.watson@plato.edu',
    term: 'Summer 2025',
    total_points: 800,
    current_grade: 0,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'English',
    credits: 3,
    prerequisites: [],
    room_location: 'ENGL 150',
    meeting_times: 'MWF 9:00-9:50 AM',
    syllabus: `Course Description:
This introductory literature course develops students' abilities to read, analyze, and write about literary texts from diverse traditions. Students will explore poetry, fiction, and drama while developing critical thinking and analytical writing skills.

Learning Objectives:
• Develop close reading and analytical skills
• Understand literary devices, genres, and historical contexts
• Write clear, well-supported literary analyses
• Engage in thoughtful discussion about literary texts
• Appreciate diverse voices and perspectives in literature

Course Structure:
Week 1-3: Poetry and Poetic Devices
Week 4-6: Short Fiction and Narrative Techniques
Week 7-9: Drama and Theatrical Elements
Week 10-12: Novel Study and Extended Analysis
Week 13-15: Research and Critical Perspectives

Assessment:
• Participation and Discussion (20%)
• Literary Analysis Essays (40%): 4 essays, 500-750 words each
• Midterm Exam (20%): Close reading and identification
• Final Project (20%): Research paper or creative response

Required Texts:
• "Literature: A Portable Anthology" 4th Edition
• Course packet with supplementary readings`,
    modules: [
      {
        id: 1,
        name: 'Poetry and Poetic Devices',
        description: 'Introduction to poetry analysis and literary terminology',
        is_completed: false,
        items: [
          {
            id: 100.5,
            title: 'Poetry Analysis Fundamentals - Required Reading',
            type: 'reading',
            content: 'Literary texts and critical essays exploring poetry analysis fundamentals. Students will analyze narrative techniques, thematic elements, and historical contexts while developing close reading skills.',
            due_date: getRelativeDate(-7),
            status: 'graded',
            points_possible: 0,
            reading_details: {
              source: 'Literature: A Portable Anthology, 4th Edition',
              pages: '15-45, 78-92',
              estimated_time: 50,
              type: 'textbook'
            }
          },
          {
            id: 101,
            title: 'Literary Terms and Devices',
            type: 'page',
            content: 'Comprehensive guide to essential literary terms including metaphor, symbolism, meter, and rhyme scheme.',
            due_date: getRelativeDate(-5),
            status: 'graded',
            points_possible: 0
          },
          {
            id: 102,
            title: 'Poetry Analysis Discussion',
            type: 'discussion',
            content: 'Analyze the use of imagery and symbolism in assigned poems. Post your interpretation and respond to two classmates.',
            due_date: getRelativeDate(2),
            status: 'not_started',
            points_possible: 30
          }
        ]
      },
      {
        id: 2,
        name: 'Short Fiction Analysis',
        description: 'Elements of storytelling: character, plot, setting, and theme',
        is_completed: false,
        items: [
          {
            id: 103,
            title: 'Character Analysis Essay',
            type: 'assignment',
            content: 'Write a 500-word analysis of character development in one of the assigned short stories.',
            due_date: getRelativeDate(15),
            status: 'not_started',
            points_possible: 100
          }
        ]
      }
    ]
  },

  // Composition and Rhetoric Course (Prof. Michael Chen)
  {
    id: 5,
    name: 'Composition and Rhetoric',
    course_code: 'ENG102',
    description: 'Develop academic writing skills through the study of rhetoric, argument, and research methods. Focus on critical thinking, source evaluation, and persuasive writing.',
    instructor: 'Prof. Michael Chen',
    instructor_email: 'm.chen@plato.edu',
    term: 'Summer 2025',
    total_points: 900,
    current_grade: 0,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'English',
    credits: 3,
    prerequisites: ['ENG101 or equivalent'],
    room_location: 'ENGL 220',
    meeting_times: 'TR 11:00-12:15 PM',
    syllabus: `Course Description:
This course focuses on developing students' academic writing and critical thinking skills. Students will learn to construct effective arguments, conduct research, and write in various academic and professional genres.

Learning Objectives:
• Master the writing process from brainstorming to revision
• Develop strong thesis statements and supporting arguments
• Learn to evaluate and integrate source material effectively
• Practice various rhetorical strategies and writing genres
• Build research and citation skills (MLA format)

Major Assignments:
Week 1-3: Personal Narrative and Reflection
Week 4-6: Rhetorical Analysis of Public Texts
Week 7-9: Argumentative Essay with Research
Week 10-12: Multimedia Presentation Project
Week 13-15: Portfolio Reflection and Final Revision

Assessment:
• Essays and Writing Projects (60%): 4 major assignments
• Peer Review and Workshops (15%)
• Research and Citation Exercises (15%)
• Final Portfolio (10%)

Required Materials:
• "They Say / I Say" 5th Edition
• Course website for additional readings and resources`,
    modules: [
      {
        id: 1,
        name: 'Foundations of Academic Writing',
        description: 'Writing process, thesis development, and paragraph structure',
        is_completed: false,
        items: [
          {
            id: 201,
            title: 'Writing Process Reflection',
            type: 'assignment',
            content: 'Reflect on your writing process and identify areas for improvement. 300-word response.',
            due_date: getRelativeDate(-3),
            status: 'graded',
            grade: 0,
            points_possible: 50
          },
          {
            id: 202,
            title: 'Thesis Statement Workshop',
            type: 'discussion',
            content: 'Share draft thesis statements for peer feedback. Practice identifying strong vs. weak thesis statements.',
            due_date: getRelativeDate(5),
            status: 'not_started',
            points_possible: 25
          }
        ]
      },
      {
        id: 2,
        name: 'Research and Documentation',
        description: 'Source evaluation, research strategies, and MLA citation',
        is_completed: false,
        items: [
          {
            id: 203,
            title: 'Research Proposal',
            type: 'assignment',
            content: 'Submit a 500-word research proposal including topic, research questions, and preliminary sources.',
            due_date: getRelativeDate(18),
            status: 'not_started',
            points_possible: 100
          }
        ]
      }
    ]
  },

  // Creative Writing Course (Dr. Lisa Rivera)
  {
    id: 6,
    name: 'Introduction to Creative Writing',
    course_code: 'ENG201',
    description: 'Explore creative writing through poetry, fiction, and creative nonfiction. Develop your unique voice while learning fundamental craft techniques.',
    instructor: 'Dr. Lisa Rivera',
    instructor_email: 'l.rivera@plato.edu',
    term: 'Summer 2025',
    total_points: 750,
    current_grade: 0,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'English',
    credits: 3,
    prerequisites: ['ENG101'],
    room_location: 'ENGL 340',
    meeting_times: 'MW 2:00-3:15 PM',
    syllabus: `Course Description:
This workshop-based course introduces students to creative writing across multiple genres. Students will read contemporary literature, practice writing techniques, and participate in constructive peer critique.

Learning Objectives:
• Develop skills in poetry, fiction, and creative nonfiction
• Learn fundamental craft elements: character, setting, voice, imagery
• Practice revision and editing techniques
• Participate constructively in writing workshops
• Read and analyze contemporary creative works

Workshop Structure:
• Week 1-5: Poetry workshops and exercises
• Week 6-10: Fiction writing and critique
• Week 11-15: Creative nonfiction and portfolio preparation

Assessment:
• Workshop Participation (25%)
• Writing Exercises and Drafts (30%)
• Revised Portfolio (35%)
• Reading Responses (10%)

Required Texts:
• "The Best American Short Stories" (current year)
• "The Best American Poetry" (current year)
• Course packet with craft essays and examples`,
    modules: [
      {
        id: 1,
        name: 'Poetry Workshop',
        description: 'Fundamentals of poetry writing and critique',
        is_completed: false,
        items: [
          {
            id: 301,
            title: 'Imagery and Metaphor Exercise',
            type: 'assignment',
            content: 'Write three short poems focusing on vivid imagery and original metaphors. 150-word reflection on your process.',
            due_date: getRelativeDate(8),
            status: 'not_started',
            points_possible: 75
          }
        ]
      }
    ]
  },

  // Computer Systems Engineering Course (Dr. James Wilson)
  {
    id: 7,
    name: 'Computer Systems Engineering',
    course_code: 'CSE205',
    description: 'Object-oriented programming and data structure implementation. Covers design of computational solutions, algorithm development, programming style, documentation, efficiency, debugging, and testing.',
    instructor: 'Dr. James Wilson',
    instructor_email: 'j.wilson@plato.edu',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 0,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Computer Science & Engineering',
    credits: 3,
    prerequisites: ['CSE 110 or equivalent programming experience'],
    room_location: 'ENGR 230',
    meeting_times: 'MWF 1:00-1:50 PM',
    syllabus: `Course Description:
Continuation of object-oriented programming and introduction to data structures. Students will learn algorithm analysis, recursion, and fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs.

Learning Objectives:
• Master object-oriented programming principles
• Implement and analyze fundamental data structures
• Develop efficient algorithms and analyze their complexity
• Practice software engineering principles including testing and debugging
• Understand recursion and its applications

Programming Language: Java

Weekly Structure:
• Monday: Lecture - Conceptual Introduction
• Wednesday: Lecture - Implementation Details  
• Friday: Lab Session - Hands-on Programming

Assessment:
• Programming Assignments (50%): 5 major projects
• Quizzes (20%): Weekly concept checks
• Midterm Exam (15%): Algorithm analysis and design
• Final Project (15%): Comprehensive data structure application

Required Materials:
• "Data Structures and Algorithm Analysis in Java" 3rd Edition
• Eclipse or IntelliJ IDEA development environment`,
    modules: [
      {
        id: 1,
        name: 'Object-Oriented Programming Review',
        description: 'Review of classes, objects, inheritance, and polymorphism',
        is_completed: false,
        items: [
          {
            id: 401,
            title: 'OOP Fundamentals Quiz',
            type: 'quiz',
            content: 'Test your understanding of classes, objects, and inheritance.',
            due_date: getRelativeDate(3),
            status: 'not_started',
            points_possible: 50
          }
        ]
      },
      {
        id: 2,
        name: 'Algorithm Analysis and Big-O Notation',
        description: 'Introduction to algorithmic complexity and performance analysis',
        is_completed: false,
        items: [
          {
            id: 402,
            title: 'Big-O Analysis Assignment',
            type: 'assignment',
            content: 'Analyze the time complexity of various algorithms and provide Big-O notation.',
            due_date: getRelativeDate(10),
            status: 'not_started',
            points_possible: 100
          }
        ]
      }
    ]
  },

  // Environmental Science Course (Nari Miller - Real ASU Faculty)
  {
    id: 8,
    name: 'Environmental Science: Water Planet',
    course_code: 'SOS 182',
    description: 'Explore Earth\'s hydrological systems from hillslope processes to global patterns. Connect local geological processes to regional landscape evolution through hands-on investigation and real-world applications.',
    instructor: 'Nari Miller',
    instructor_email: 'nari.miller@asu.edu',
    term: 'Summer 2025',
    total_points: 1200,
    current_grade: 0,
    start_date: getRelativeDate(-10),
    end_date: getRelativeDate(65),
    department: 'School of Earth and Space Exploration',
    credits: 3,
    prerequisites: ['None - introductory course'],
    room_location: 'ISTB4 164',
    meeting_times: 'MW 2:10-3:25 PM',
    syllabus: `Course Description:
This course examines environmental issues from scientific, social, and economic perspectives. Students will explore ecosystem structure and function, biodiversity, pollution, climate change, and sustainable resource management.

Learning Objectives:
• Understand ecological principles and ecosystem dynamics
• Analyze human impacts on environment and natural resources
• Evaluate environmental policies and sustainability practices
• Develop scientific literacy for environmental decision-making
• Practice field and laboratory research techniques

Course Modules:
Week 1-3: Ecosystem Structure and Energy Flow
Week 4-6: Biodiversity and Conservation Biology
Week 7-9: Pollution and Environmental Health
Week 10-12: Climate Change and Global Systems
Week 13-15: Sustainability and Environmental Policy

Assessment:
• Lab Reports (30%): 8 weekly lab exercises
• Research Project (25%): Environmental case study analysis
• Exams (30%): 2 midterms and comprehensive final
• Field Trip Reports (15%): 2 local ecosystem studies

Required Materials:
• "Environmental Science: A Global Concern" 14th Edition
• Lab manual and safety equipment provided`,
    modules: [
      {
        id: 1,
        name: 'Ecosystem Fundamentals',
        description: 'Introduction to ecosystem structure, energy flow, and nutrient cycling',
        is_completed: false,
        items: [
          {
            id: 501,
            title: 'Ecosystem Energy Flow Lab',
            type: 'assignment',
            content: 'Investigate energy transfer through trophic levels in a local ecosystem.',
            due_date: getRelativeDate(7),
            status: 'not_started',
            points_possible: 75
          }
        ]
      }
    ]
  },

  // Mechanical Engineering Course (Prof. David Kumar)
  {
    id: 9,
    name: 'Introduction to Engineering',
    course_code: 'FSE100',
    description: 'Introduces the engineering design process, working in engineering teams, the profession of engineering, engineering models, and written and oral technical communication skills.',
    instructor: 'Prof. David Kumar',
    instructor_email: 'd.kumar@plato.edu',
    term: 'Summer 2025',
    total_points: 600,
    current_grade: 0,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Mechanical & Aerospace Engineering',
    credits: 2,
    prerequisites: [],
    room_location: 'ENGR 101',
    meeting_times: 'TR 9:00-10:15 AM',
    syllabus: `Course Description:
This course introduces first-year students to engineering as a profession and the engineering design process. Students work in teams to design, build, and test solutions to real-world problems while developing technical communication skills.

Learning Objectives:
• Understand the engineering design process and methodology
• Develop teamwork and project management skills
• Practice technical writing and oral presentation skills
• Explore engineering disciplines and career paths
• Build and test engineering prototypes
• Apply mathematical and scientific principles to solve problems

Design Projects:
• Project 1: Bridge Design Challenge
• Project 2: Sustainable Energy Solution
• Project 3: Assistive Technology Device

Assessment:
• Design Projects (60%): 3 team-based engineering challenges
• Technical Reports (20%): Written documentation of design process
• Presentations (15%): Oral communication of project results
• Professional Development (5%): Career exploration and reflection

Required Materials:
• "Thinking Like an Engineer" 4th Edition
• Basic prototyping materials provided`,
    modules: [
      {
        id: 1,
        name: 'Engineering Design Process',
        description: 'Introduction to systematic problem-solving methodology',
        is_completed: false,
        items: [
          {
            id: 601,
            title: 'Design Process Reflection',
            type: 'assignment',
            content: 'Reflect on the engineering design process and identify key steps.',
            due_date: getRelativeDate(4),
            status: 'not_started',
            points_possible: 40
          }
        ]
      }
    ]
  },

  // Human-Computer Interaction Course (Dr. Robert Atkinson - based on real ASU faculty)
  {
    id: 10,
    name: 'Introduction to Human-Computer Interaction',
    course_code: 'CSE463',
    description: 'Principles, theories, and methodologies in Human-Computer Interaction. Covers user-centered design, interface development, cognitive aspects, usability testing, and accessibility.',
    instructor: 'Dr. Robert Atkinson',
    instructor_email: 'r.atkinson@plato.edu',
    term: 'Summer 2025',
    total_points: 900,
    current_grade: 0,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Computer Science & Engineering',
    credits: 3,
    prerequisites: ['CSE 110 or equivalent programming experience'],
    room_location: 'ENGR 240',
    meeting_times: 'MW 2:00-3:15 PM',
    syllabus: `Course Description:
This course introduces students to the fundamental principles and practices of Human-Computer Interaction (HCI). Students will learn user-centered design methodologies, interface development techniques, and evaluation methods for creating effective interactive systems.

Learning Objectives:
1. Understand fundamental HCI principles and theories
2. Apply user-centered design methodologies
3. Conduct usability testing and evaluation
4. Design accessible and inclusive interfaces
5. Analyze cognitive aspects of user interaction

Assessment:
- Participation: 10%
- Design Projects: 40%
- Usability Testing Report: 25%
- Final Interface Prototype: 25%

Required Materials:
- "The Design of Everyday Things" by Don Norman
- Figma or Adobe XD (student licenses available)`,
    modules: [
      {
        id: 1,
        name: 'HCI Fundamentals',
        description: 'Introduction to human-computer interaction principles and history',
        is_completed: false,
        items: [
          {
            id: 701,
            title: 'Interface Design Critique',
            type: 'assignment',
            content: 'Analyze and critique the design of a popular mobile app using HCI principles.',
            due_date: getRelativeDate(5),
            status: 'not_started',
            points_possible: 60
          }
        ]
      }
    ]
  },

  // Distributed Software Development Course (Dr. Yinong Chen - based on real ASU faculty)
  {
    id: 11,
    name: 'Distributed Software Development',
    course_code: 'CSE445',
    description: 'Distributed software development methodologies, service-oriented architectures, cloud computing platforms, and collaborative development practices for modern software systems.',
    instructor: 'Dr. Yinong Chen',
    instructor_email: 'y.chen@plato.edu',
    term: 'Summer 2025',
    total_points: 950,
    current_grade: 0,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Computer Science & Engineering',
    credits: 3,
    prerequisites: ['CSE 240 - Introduction to Programming Languages'],
    room_location: 'ENGR 250',
    meeting_times: 'TR 10:30-11:45 AM',
    syllabus: `Course Description:
Students learn distributed software development methodologies including service-oriented computing, microservices architecture, cloud platforms, and modern collaborative development practices.

Learning Objectives:
1. Design distributed software architectures
2. Implement service-oriented solutions
3. Deploy applications on cloud platforms
4. Apply DevOps and continuous integration practices
5. Collaborate effectively in distributed teams

Assessment:
- Programming Assignments: 35%
- Midterm Project: 25%
- Final Distributed System: 30%
- Participation & Peer Reviews: 10%

Required Materials:
- "Building Microservices" by Sam Newman
- AWS/Azure student accounts provided`,
    modules: [
      {
        id: 1,
        name: 'Service-Oriented Architecture',
        description: 'Introduction to SOA principles and distributed system design',
        is_completed: false,
        items: [
          {
            id: 801,
            title: 'Microservices Design Exercise',
            type: 'assignment',
            content: 'Design a microservices architecture for a given application scenario.',
            due_date: getRelativeDate(9),
            status: 'not_started',
            points_possible: 85
          }
        ]
      }
    ]
  },

  // Machine Learning Course (Dr. Kristen Jaskie - based on real ASU faculty)
  {
    id: 12,
    name: 'Introduction to Machine Learning',
    course_code: 'CSE475',
    description: 'Introduction to machine learning algorithms and applications. Covers supervised and unsupervised learning, neural networks, and practical implementation using Python and scikit-learn.',
    instructor: 'Dr. Kristen Jaskie',
    instructor_email: 'k.jaskie@plato.edu',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 0,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Computer Science & Engineering',
    credits: 3,
    prerequisites: ['MAT 265 - Calculus I', 'CSE 240 - Programming Languages'],
    room_location: 'ENGR 260',
    meeting_times: 'MWF 11:00-11:50 AM + Lab F 2:00-3:50 PM',
    syllabus: `Course Description:
This course provides a comprehensive introduction to machine learning concepts, algorithms, and practical applications. Students will implement ML algorithms and work with real datasets to solve classification, regression, and clustering problems.

Learning Objectives:
1. Understand fundamental ML concepts and terminology
2. Implement supervised and unsupervised learning algorithms
3. Apply feature engineering and data preprocessing techniques
4. Evaluate model performance and avoid overfitting
5. Use Python libraries for machine learning (scikit-learn, pandas, numpy)

Weekly Structure:
- Monday: Theoretical foundations and algorithm concepts
- Wednesday: Mathematical foundations and derivations
- Friday: Practical implementation and coding exercises

Assessment:
- Programming Assignments (40%): 5 hands-on ML projects
- Midterm Exam (20%): Theory and mathematical foundations
- Final Project (25%): End-to-end ML pipeline on real dataset
- Lab Exercises (15%): Weekly coding practice

Required Materials:
- "Hands-On Machine Learning" by Aurélien Géron
- Python 3.8+, Jupyter Notebooks, scikit-learn`,
    modules: [
      {
        id: 1,
        name: 'Introduction to Machine Learning',
        description: 'ML fundamentals, types of learning, and the machine learning pipeline',
        is_completed: false,
        items: [
          {
            id: 901,
            title: 'ML Fundamentals Quiz',
            type: 'quiz',
            content: 'Test understanding of basic ML concepts and terminology.',
            due_date: getRelativeDate(6),
            status: 'not_started',
            points_possible: 50
          }
        ]
      }
    ]
  },

  // Course 14: Elementary Chinese I (Fangzhou Shi - Real ASU Course)
  {
    id: 14,
    name: 'Elementary Chinese I',
    course_code: 'CHI 101',
    description: 'Introduction to modern Chinese language with emphasis on pronunciation, basic sentence patterns, and character recognition. Development of elementary speaking, listening, reading and writing skills.',
    instructor: 'Fangzhou Shi',
    instructor_email: 'fangzh10@asu.edu',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 89,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'TCLAS School of International Letters and Cultures',
    credits: 4,
    prerequisites: [],
    room_location: 'LL 102',
    meeting_times: 'MTWRF 9:00-9:50 AM',
    syllabus: `Course Description:
CHI 101 Elementary Chinese I introduces students to modern Chinese language with emphasis on standard pronunciation, basic sentence patterns, and fundamental character recognition. The course develops elementary proficiency in all four language skills: speaking, listening, reading, and writing.

Learning Objectives:
• Master Pinyin romanization system and standard pronunciation
• Learn approximately 300 high-frequency Chinese characters
• Develop basic conversational skills for everyday situations
• Understand fundamental Chinese grammar patterns
• Gain cultural awareness of Chinese-speaking communities
• Build foundation for intermediate Chinese study

Course Components:
• Daily oral practice and pronunciation drills
• Character writing and recognition exercises
• Listening comprehension activities
• Cultural context discussions
• Digital language learning tools integration

Assessment:
• Daily Participation (20%): Active engagement in class activities
• Character Quizzes (25%): Weekly character recognition and writing
• Oral Assessments (20%): Pronunciation and conversation skills
• Listening Comprehension (15%): Audio-based exercises
• Final Comprehensive Exam (20%): All four skills integration

Cultural Immersion: Students will engage with authentic Chinese materials including simple texts, audio recordings, and cultural artifacts to develop real-world language application skills.`,
    modules: [
      {
        id: 1,
        name: 'Pinyin and Basic Pronunciation',
        description: 'Master the Pinyin romanization system and Chinese tones',
        is_completed: true,
        items: [
          {
            id: 141,
            title: 'Tone Practice Audio Assignment',
            type: 'assignment',
            content: 'Record yourself pronouncing the four basic Chinese tones with provided vocabulary words. Submit audio recording demonstrating accurate tone production.',
            due_date: getRelativeDate(-10),
            status: 'graded',
            grade: 92,
            points_possible: 50,
            submissions: 1,
            feedback: 'Excellent tone accuracy! Pay attention to third tone dip.'
          },
          {
            id: 142,
            title: 'Pinyin Recognition Quiz',
            type: 'quiz',
            content: 'Test your ability to identify correct Pinyin spelling and tone marks for spoken Chinese syllables.',
            due_date: getRelativeDate(-7),
            status: 'graded',
            grade: 88,
            points_possible: 25,
            attempts: 1,
            max_attempts: 2
          }
        ]
      },
      {
        id: 2,
        name: 'Basic Characters and Greetings',
        description: 'Learn fundamental Chinese characters and greeting expressions',
        is_completed: false,
        items: [
          {
            id: 143,
            title: 'Greetings and Introductions Discussion',
            type: 'discussion',
            content: 'Practice Chinese greetings and self-introductions. Post a video introducing yourself in Chinese and respond to classmates in Chinese.',
            due_date: getRelativeDate(3),
            status: 'in_progress',
            points_possible: 30,
            submissions: 0
          },
          {
            id: 144,
            title: 'Character Stroke Order Practice',
            type: 'assignment',
            content: 'Practice writing 20 basic Chinese characters following proper stroke order. Submit handwritten samples and digital practice sheets.',
            due_date: getRelativeDate(5),
            status: 'not_started',
            points_possible: 40,
            submissions: 0,
            max_attempts: 2
          }
        ]
      },
      {
        id: 3,
        name: 'Numbers and Time Expressions',
        description: 'Learn Chinese numbers, dates, and time expressions',
        is_completed: false,
        items: [
          {
            id: 145,
            title: 'Time and Date Listening Exercise',
            type: 'quiz',
            content: 'Listen to Chinese audio clips about times and dates. Select correct answers for comprehension questions.',
            due_date: getRelativeDate(8),
            status: 'not_started',
            points_possible: 35,
            max_attempts: 2
          }
        ]
      }
    ]
  },

  // Course 13: Technology Literacy (Jennifer Werner - Real ASU Course)
  {
    id: 13,
    name: 'Technology Literacy: Problem Solving using Digital Technology Applications',
    course_code: 'EDT 180',
    description: 'Introduces digital technologies and their place in society. Applies 21st-century skills to problem solving using digital technology applications including spreadsheets and databases.',
    instructor: 'Jennifer Werner',
    instructor_email: 'jennifer.werner.2@asu.edu',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 92,
    start_date: getRelativeDate(-23),
    end_date: getRelativeDate(72),
    department: 'Mary Lou Fulton Teachers College',
    credits: 3,
    prerequisites: [],
    room_location: 'iCourse (Online)',
    meeting_times: 'Online - Asynchronous with scheduled check-ins',
    syllabus: `Course Overview:
EDT 180 introduces students to digital technologies and their role in modern society. Students will develop 21st-century problem-solving skills using digital technology applications including spreadsheets, databases, and other contemporary tools.

General Studies Requirements:
• Gold QTRS: Quantitative Reasoning
• Maroon CS: Computer/Statistics/Quantitative Applications

Learning Objectives:
• Understand the role of digital technologies in society
• Apply problem-solving methodologies using digital tools
• Master spreadsheet applications for data analysis and visualization
• Design and implement database solutions for information management
• Develop digital literacy and computational thinking skills
• Evaluate ethical implications of technology use

Course Components:
Week 1-2: Digital Technology in Society
Week 3-4: Problem-Solving Frameworks and Methodologies
Week 5-6: Spreadsheet Applications and Data Analysis
Week 7-8: Database Design and Implementation
Week 9-10: Advanced Digital Tools and Applications
Week 11-12: Ethics in Technology and Final Projects

Assessment:
• Digital Projects (40%): 5 hands-on technology applications
• Problem-Solving Assignments (25%): Applied scenarios using digital tools
• Online Discussions (20%): Technology and society analysis
• Final Portfolio (15%): Comprehensive technology application project

Course Format: Integrated Lecture/Lab (Online)
Office Hours: Virtual office hours by appointment
Note: Fulfills CS requirement for Education majors`,
    modules: [
      {
        id: 1,
        name: 'Digital Technology Foundations',
        description: 'Introduction to digital technologies and their societal impact',
        is_completed: true,
        items: [
          {
            id: 40,
            title: 'Technology in Society Analysis',
            type: 'discussion',
            content: 'Analyze how digital technologies have transformed various sectors of society and discuss both positive and negative impacts.',
            due_date: getRelativeDate(-15),
            status: 'graded',
            grade: 95,
            points_possible: 50
          },
          {
            id: 41,
            title: 'Digital Literacy Self-Assessment',
            type: 'assignment',
            content: 'Complete a comprehensive assessment of your current digital literacy skills and create a learning plan for the semester.',
            due_date: getRelativeDate(-12),
            status: 'graded',
            grade: 88,
            points_possible: 75,
            submissions: 1
          }
        ]
      },
      {
        id: 2,
        name: 'Problem-Solving with Digital Tools',
        description: 'Applying systematic problem-solving approaches using technology',
        is_completed: false,
        items: [
          {
            id: 42,
            title: 'Spreadsheet Data Analysis Project',
            type: 'assignment',
            content: 'Use spreadsheet applications to analyze a real-world dataset, create visualizations, and present findings with recommendations.',
            due_date: getRelativeDate(3),
            status: 'in_progress',
            points_possible: 150
          },
          {
            id: 43,
            title: 'Database Design Challenge',
            type: 'assignment',
            content: 'Design and implement a database solution for a small business scenario, including data modeling and query optimization.',
            due_date: getRelativeDate(7),
            status: 'not_started',
            points_possible: 125
          }
        ]
      }
    ]
  },

  // Add the popular music piano course
  generatePopularMusicPianoCourse()
];

// Comprehensive assignment data with proper course connections
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
  },

  // ENG101 (Introduction to Literature) Assignments
  {
    id: 7,
    name: 'Poetry Analysis Essay',
    description: 'Write a 750-word analysis of either Emily Dickinson\'s "Because I could not stop for Death" or Robert Frost\'s "The Road Not Taken." Focus on how poetic devices create meaning.',
    due_at: getRelativeDate(11),
    course_id: 4,
    points_possible: 100,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      '750-word minimum length',
      'Focus on 2-3 specific poetic devices',
      'Include direct quotations with line numbers',
      'Connect devices to overall theme/meaning',
      'MLA format required'
    ],
    rubric: [
      { criterion: 'Thesis and Analysis', points: 30, description: 'Clear thesis connecting devices to meaning' },
      { criterion: 'Evidence and Support', points: 25, description: 'Effective use of quotations and examples' },
      { criterion: 'Literary Understanding', points: 25, description: 'Accurate identification and analysis of devices' },
      { criterion: 'Writing Quality', points: 15, description: 'Clear prose and proper grammar' },
      { criterion: 'Format', points: 5, description: 'Proper MLA format and citations' }
    ]
  },

  {
    id: 8,
    name: 'Character Development Analysis',
    description: 'Analyze character development in one of our assigned short stories, focusing on how the author reveals character through dialogue, action, and description.',
    due_at: getRelativeDate(19),
    course_id: 4,
    points_possible: 100,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Choose from assigned short story list',
      '500-650 words in length',
      'Focus on one main character',
      'Analyze specific textual evidence',
      'Consider character arc and change'
    ]
  },

  // ENG102 (Composition and Rhetoric) Assignments
  {
    id: 9,
    name: 'Rhetorical Analysis Essay',
    description: 'Analyze the rhetorical strategies used in a contemporary speech, advertisement, or editorial. Examine how the author uses ethos, pathos, and logos to persuade their audience.',
    due_at: getRelativeDate(13),
    course_id: 5,
    points_possible: 125,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      '800-1000 words in length',
      'Choose from approved text list',
      'Identify target audience and context',
      'Analyze specific rhetorical strategies',
      'Evaluate effectiveness of persuasion',
      'Include works cited page'
    ],
    rubric: [
      { criterion: 'Rhetorical Understanding', points: 35, description: 'Accurate identification of rhetorical strategies' },
      { criterion: 'Analysis and Evaluation', points: 30, description: 'Thoughtful evaluation of effectiveness' },
      { criterion: 'Evidence and Support', points: 25, description: 'Strong textual evidence and examples' },
      { criterion: 'Organization', points: 20, description: 'Clear structure and flow' },
      { criterion: 'Grammar and Citations', points: 15, description: 'Proper grammar and MLA format' }
    ]
  },

  {
    id: 10,
    name: 'Research-Based Argument Essay',
    description: 'Write a persuasive essay on a current social issue, incorporating at least 5 credible sources to support your position.',
    due_at: getRelativeDate(25),
    course_id: 5,
    points_possible: 150,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      '1200-1500 words in length',
      'Minimum 5 credible sources',
      'Clear argumentative thesis',
      'Address counterarguments',
      'Proper in-text citations and works cited',
      'Submit research proposal first'
    ]
  },

  // ENG201 (Creative Writing) Assignments
  {
    id: 301,
    name: 'Imagery and Metaphor Exercise',
    description: 'Write three short poems focusing on vivid imagery and original metaphors. Include a 150-word reflection on your creative process.',
    due_at: getRelativeDate(8),
    course_id: 6,
    points_possible: 75,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Write three original short poems',
      'Focus on vivid, concrete imagery',
      'Incorporate original metaphors (avoid clichés)',
      'Vary poem length and structure',
      'Include 150-word process reflection',
      'Submit typed copies in proper format'
    ],
    rubric: [
      { criterion: 'Imagery Quality', points: 25, description: 'Vivid, concrete, and evocative imagery' },
      { criterion: 'Metaphor Use', points: 20, description: 'Original and effective metaphorical language' },
      { criterion: 'Poetic Craft', points: 15, description: 'Attention to rhythm, sound, and structure' },
      { criterion: 'Creativity', points: 10, description: 'Original voice and imaginative expression' },
      { criterion: 'Process Reflection', points: 5, description: 'Thoughtful analysis of creative choices' }
    ]
  },

  {
    id: 11,
    name: 'Poetry Portfolio',
    description: 'Submit a collection of 5 original poems demonstrating different forms and techniques covered in class.',
    due_at: getRelativeDate(16),
    course_id: 6,
    points_possible: 100,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      '5 original poems minimum',
      'Demonstrate variety in form/style',
      'Include one formal verse poem',
      'Include brief reflection on process',
      'Revised from workshop feedback'
    ],
    rubric: [
      { criterion: 'Creative Expression', points: 30, description: 'Original voice and creative use of language' },
      { criterion: 'Technical Skill', points: 25, description: 'Effective use of poetic devices and form' },
      { criterion: 'Variety and Range', points: 20, description: 'Demonstrates exploration of different styles' },
      { criterion: 'Revision Quality', points: 15, description: 'Evidence of thoughtful revision' },
      { criterion: 'Reflection', points: 10, description: 'Insightful process reflection' }
    ]
  },

  {
    id: 12,
    name: 'Short Fiction Piece',
    description: 'Write an original short story (1500-2500 words) that demonstrates effective use of character, setting, conflict, and narrative voice.',
    due_at: getRelativeDate(28),
    course_id: 6,
    points_possible: 125,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      '1500-2500 words in length',
      'Clear narrative structure',
      'Well-developed characters',
      'Effective use of dialogue',
      'Strong sense of place/setting',
      'Polished prose style'
    ]
  },

  // CHI 101 (Elementary Chinese I) Assignments
  {
    id: 141,
    name: 'Tone Practice Audio Assignment',
    description: 'Record yourself pronouncing the four basic Chinese tones with provided vocabulary words. Submit audio recording demonstrating accurate tone production.',
    due_at: getRelativeDate(-10),
    course_id: 14,
    points_possible: 50,
    submission_type: 'online_upload',
    status: 'graded',
    grade: 92,
    feedback: 'Excellent tone accuracy! Pay attention to third tone dip.',
    submissions: 1,
    requirements: [
      'Record 20 vocabulary words with all four tones',
      'Demonstrate clear pronunciation of tone contours',
      'Submit MP3 or WAV audio file',
      'Include written Pinyin transcription',
      'Practice with tone pair combinations'
    ],
    rubric: [
      { criterion: 'Tone Accuracy', points: 20, description: 'Correct production of four basic tones' },
      { criterion: 'Pronunciation Clarity', points: 15, description: 'Clear articulation of syllables' },
      { criterion: 'Tone Contour', points: 10, description: 'Proper tone shape and pitch changes' },
      { criterion: 'Audio Quality', points: 5, description: 'Clear recording without background noise' }
    ]
  },

  {
    id: 142,
    name: 'Pinyin Recognition Quiz',
    description: 'Test your ability to identify correct Pinyin spelling and tone marks for spoken Chinese syllables.',
    due_at: getRelativeDate(-7),
    course_id: 14,
    points_possible: 25,
    submission_type: 'online_quiz',
    status: 'graded',
    grade: 88,
    attempts: 1,
    max_attempts: 2,
    quiz_details: {
      time_limit: 30,
      allowed_attempts: 2,
      questions: [
        {
          id: 1,
          question: 'Which Pinyin represents the first tone?',
          type: 'multiple_choice',
          options: ['mā', 'má', 'mǎ', 'mà'],
          correct_answer: 0,
          points: 5,
          explanation: 'The first tone is marked with a macron (ā) indicating high level tone.'
        }
      ]
    }
  },

  {
    id: 143,
    name: 'Greetings and Introductions Discussion',
    description: 'Practice Chinese greetings and self-introductions. Post a video introducing yourself in Chinese and respond to classmates in Chinese.',
    due_at: getRelativeDate(3),
    course_id: 14,
    points_possible: 30,
    submission_type: 'discussion_topic',
    status: 'in_progress',
    submissions: 0,
    requirements: [
      'Record 2-3 minute video introduction in Chinese',
      'Include basic greetings and personal information',
      'Use vocabulary from Units 1-2',
      'Respond to at least 2 classmates in Chinese',
      'Practice natural conversation flow'
    ],
    rubric: [
      { criterion: 'Vocabulary Usage', points: 10, description: 'Correct use of greeting vocabulary' },
      { criterion: 'Pronunciation', points: 8, description: 'Clear pronunciation and tones' },
      { criterion: 'Conversation Flow', points: 7, description: 'Natural pace and expression' },
      { criterion: 'Peer Interaction', points: 5, description: 'Meaningful responses to classmates' }
    ]
  },

  {
    id: 144,
    name: 'Character Stroke Order Practice',
    description: 'Practice writing 20 basic Chinese characters following proper stroke order. Submit handwritten samples and digital practice sheets.',
    due_at: getRelativeDate(5),
    course_id: 14,
    points_possible: 40,
    submission_type: 'online_upload',
    status: 'not_started',
    submissions: 0,
    max_attempts: 2,
    requirements: [
      'Practice 20 basic Chinese characters from Unit 2',
      'Follow proper stroke order for each character',
      'Submit handwritten practice sheets (scan/photo)',
      'Complete digital stroke order exercises',
      'Include character meaning and pronunciation'
    ],
    rubric: [
      { criterion: 'Stroke Order Accuracy', points: 15, description: 'Correct sequence for all characters' },
      { criterion: 'Character Formation', points: 10, description: 'Proper proportion and structure' },
      { criterion: 'Completeness', points: 10, description: 'All 20 characters completed' },
      { criterion: 'Digital Practice', points: 5, description: 'Online exercises completed' }
    ]
  },

  {
    id: 145,
    name: 'Time and Date Listening Exercise',
    description: 'Listen to Chinese audio clips about times and dates. Select correct answers for comprehension questions.',
    due_at: getRelativeDate(8),
    course_id: 14,
    points_possible: 35,
    submission_type: 'online_quiz',
    status: 'not_started',
    max_attempts: 2,
    quiz_details: {
      time_limit: 45,
      allowed_attempts: 2,
      questions: [
        {
          id: 1,
          question: 'What time is mentioned in the audio clip?',
          type: 'multiple_choice',
          options: ['8:30', '9:30', '10:30', '11:30'],
          correct_answer: 1,
          points: 7,
          explanation: 'The speaker says "jiǔ diǎn bàn" which means 9:30.'
        }
      ]
    }
  },

  // CSE205 (Computer Systems Engineering) Assignments
  {
    id: 13,
    name: 'Data Structures Implementation Project',
    description: 'Implement fundamental data structures (ArrayList, LinkedList, Stack, Queue) in Java with comprehensive testing and documentation.',
    due_at: getRelativeDate(14),
    course_id: 7,
    points_possible: 150,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Implement 4 data structures with generic types',
      'Include thorough JUnit test suites',
      'Provide complexity analysis for all operations',
      'Follow Java coding conventions and documentation standards',
      'Submit via GitHub repository with commit history'
    ],
    rubric: [
      { criterion: 'Implementation Quality', points: 50, description: 'Correct and efficient data structure implementations' },
      { criterion: 'Testing', points: 30, description: 'Comprehensive test coverage and edge cases' },
      { criterion: 'Documentation', points: 25, description: 'Clear JavaDoc and README documentation' },
      { criterion: 'Code Style', points: 25, description: 'Adherence to Java conventions and best practices' },
      { criterion: 'Analysis', points: 20, description: 'Accurate Big-O complexity analysis' }
    ]
  },

  // BIO130 (Environmental Science) Assignments
  {
    id: 14,
    name: 'Ecosystem Field Study Report',
    description: 'Conduct a field study of a local ecosystem, documenting species diversity, environmental factors, and human impacts.',
    due_at: getRelativeDate(21),
    course_id: 8,
    points_possible: 120,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Choose an accessible local ecosystem for study',
      'Document at least 15 species with photos and descriptions',
      'Measure environmental factors (temperature, pH, etc.)',
      'Analyze human impact and propose conservation measures',
      '2000-word report with proper scientific formatting',
      'Include data tables, graphs, and photographic evidence'
    ],
    rubric: [
      { criterion: 'Field Data Collection', points: 35, description: 'Thorough and accurate ecosystem documentation' },
      { criterion: 'Species Identification', points: 25, description: 'Correct identification and classification' },
      { criterion: 'Environmental Analysis', points: 30, description: 'Measurement and interpretation of environmental factors' },
      { criterion: 'Conservation Recommendations', points: 20, description: 'Realistic and science-based proposals' },
      { criterion: 'Report Quality', points: 10, description: 'Professional formatting and clear communication' }
    ]
  },

  // FSE100 (Introduction to Engineering) Assignments
  {
    id: 19,
    name: 'Design Process Reflection',
    description: 'Reflect on the engineering design process and identify key steps, challenges, and best practices.',
    due_at: getRelativeDate(4),
    course_id: 9,
    points_possible: 40,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Define and explain each step of the engineering design process',
      'Provide real-world examples for each step',
      'Identify common challenges engineers face during each phase',
      'Discuss how iteration and feedback improve designs',
      'Reflect on the importance of user-centered design',
      'Include at least 3 credible sources and proper citations'
    ],
    rubric: [
      { criterion: 'Process Understanding', points: 15, description: 'Clear explanation of design process steps' },
      { criterion: 'Examples & Applications', points: 10, description: 'Relevant real-world examples provided' },
      { criterion: 'Critical Analysis', points: 10, description: 'Thoughtful analysis of challenges and solutions' },
      { criterion: 'Writing Quality', points: 5, description: 'Clear, professional writing with proper citations' }
    ]
  },

  {
    id: 15,
    name: 'Bridge Design Challenge',
    description: 'Design and build a bridge using specified materials that can support maximum weight while minimizing cost.',
    due_at: getRelativeDate(17),
    course_id: 9,
    points_possible: 100,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Use only provided materials (popsicle sticks, glue, string)',
      'Bridge must span 30cm gap',
      'Document design process with sketches and calculations',
      'Test bridge with incremental loading',
      'Calculate efficiency ratio (load/weight of bridge)',
      'Present design to class with demonstration'
    ],
    rubric: [
      { criterion: 'Load Capacity', points: 30, description: 'Maximum weight supported before failure' },
      { criterion: 'Design Efficiency', points: 25, description: 'Load-to-weight ratio optimization' },
      { criterion: 'Design Process', points: 20, description: 'Documentation of engineering methodology' },
      { criterion: 'Innovation', points: 15, description: 'Creative and effective design solutions' },
      { criterion: 'Presentation', points: 10, description: 'Clear communication of design and results' }
    ]
  },

  // CSE463 (Human-Computer Interaction) Assignments
  {
    id: 13,
    name: 'Usability Testing Study',
    description: 'Conduct a comprehensive usability study of an existing website or application, including methodology design, participant recruitment, testing sessions, and analysis of results.',
    due_at: getRelativeDate(16),
    course_id: 10,
    points_possible: 120,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Select and justify choice of interface to test',
      'Design usability testing protocol with 5+ tasks',
      'Recruit and test at least 6 participants',
      'Record sessions and analyze user behaviors',
      'Identify usability issues and provide redesign recommendations',
      'Present findings in professional report format'
    ],
    rubric: [
      { criterion: 'Methodology Design', points: 25, description: 'Well-designed testing protocol and tasks' },
      { criterion: 'Data Collection', points: 30, description: 'Thorough participant testing and observation' },
      { criterion: 'Analysis Quality', points: 35, description: 'Insightful analysis of usability issues' },
      { criterion: 'Recommendations', points: 30, description: 'Actionable redesign suggestions' }
    ]
  },

  {
    id: 14,
    name: 'Accessible Interface Design Project',
    description: 'Design and prototype an accessible web interface that follows WCAG 2.1 guidelines and incorporates universal design principles.',
    due_at: getRelativeDate(21),
    course_id: 10,
    points_possible: 100,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Research accessibility needs for target user group',
      'Create wireframes and high-fidelity prototypes',
      'Implement WCAG 2.1 AA compliance features',
      'Include alternative input methods and screen reader support',
      'Test with assistive technology users',
      'Document accessibility features and design rationale'
    ],
    rubric: [
      { criterion: 'Accessibility Compliance', points: 30, description: 'Meets WCAG 2.1 AA standards' },
      { criterion: 'Design Quality', points: 25, description: 'Intuitive and aesthetically pleasing interface' },
      { criterion: 'User Testing', points: 25, description: 'Validation with accessibility users' },
      { criterion: 'Documentation', points: 20, description: 'Clear explanation of accessibility features' }
    ]
  },

  // CSE445 (Distributed Software Development) Assignments
  {
    id: 15,
    name: 'Microservices Architecture Design',
    description: 'Design and implement a distributed system using microservices architecture, including service decomposition, API design, and inter-service communication.',
    due_at: getRelativeDate(18),
    course_id: 11,
    points_possible: 140,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Decompose monolithic application into microservices',
      'Design RESTful APIs for each service',
      'Implement service-to-service communication',
      'Add service discovery and load balancing',
      'Include distributed logging and monitoring',
      'Deploy services using Docker containers'
    ],
    rubric: [
      { criterion: 'Service Design', points: 35, description: 'Well-decomposed, cohesive services' },
      { criterion: 'API Implementation', points: 30, description: 'Clean, documented REST APIs' },
      { criterion: 'Communication', points: 25, description: 'Effective inter-service communication' },
      { criterion: 'Deployment', points: 25, description: 'Successful containerization and deployment' },
      { criterion: 'Monitoring', points: 25, description: 'Comprehensive logging and health checks' }
    ]
  },

  {
    id: 16,
    name: 'Cloud-Native Application Development',
    description: 'Build and deploy a cloud-native application using modern DevOps practices, container orchestration, and automated CI/CD pipelines.',
    due_at: getRelativeDate(24),
    course_id: 11,
    points_possible: 160,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Develop application using cloud-native patterns',
      'Implement Kubernetes deployment manifests',
      'Set up automated CI/CD pipeline',
      'Configure auto-scaling and health monitoring',
      'Implement security best practices',
      'Document deployment and maintenance procedures'
    ],
    rubric: [
      { criterion: 'Application Architecture', points: 40, description: 'Cloud-native design patterns' },
      { criterion: 'Kubernetes Deployment', points: 35, description: 'Proper container orchestration' },
      { criterion: 'CI/CD Pipeline', points: 30, description: 'Automated testing and deployment' },
      { criterion: 'Monitoring & Scaling', points: 30, description: 'Observability and auto-scaling' },
      { criterion: 'Security', points: 25, description: 'Security controls and best practices' }
    ]
  },

  // CSE475 (Machine Learning) Assignments
  {
    id: 17,
    name: 'Supervised Learning Implementation',
    description: 'Implement and compare multiple supervised learning algorithms (linear regression, decision trees, SVM, neural networks) on a real-world dataset.',
    due_at: getRelativeDate(15),
    course_id: 12,
    points_possible: 130,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Select and justify choice of dataset',
      'Implement data preprocessing and feature engineering',
      'Train and tune 4+ different ML algorithms',
      'Compare model performance using appropriate metrics',
      'Analyze results and provide insights',
      'Submit Jupyter notebook with documented code'
    ],
    rubric: [
      { criterion: 'Data Preprocessing', points: 25, description: 'Thorough data cleaning and feature engineering' },
      { criterion: 'Algorithm Implementation', points: 40, description: 'Correct implementation of multiple algorithms' },
      { criterion: 'Model Evaluation', points: 30, description: 'Appropriate metrics and cross-validation' },
      { criterion: 'Analysis & Insights', points: 25, description: 'Thoughtful interpretation of results' },
      { criterion: 'Code Quality', points: 10, description: 'Clean, documented, reproducible code' }
    ]
  },

  {
    id: 18,
    name: 'Deep Learning Project',
    description: 'Design and implement a deep learning solution for image classification, natural language processing, or time series forecasting using modern neural network architectures.',
    due_at: getRelativeDate(26),
    course_id: 12,
    points_possible: 150,
    submission_type: 'online_text_entry',
    status: 'not_started',
    requirements: [
      'Choose complex real-world problem domain',
      'Design appropriate neural network architecture',
      'Implement using TensorFlow or PyTorch',
      'Apply regularization and optimization techniques',
      'Evaluate model performance and generalization',
      'Present findings with visualizations and analysis'
    ],
    rubric: [
      { criterion: 'Problem Definition', points: 20, description: 'Clear problem statement and approach' },
      { criterion: 'Architecture Design', points: 40, description: 'Appropriate neural network design' },
      { criterion: 'Implementation', points: 35, description: 'Correct use of deep learning frameworks' },
      { criterion: 'Performance Analysis', points: 30, description: 'Thorough evaluation and interpretation' },
      { criterion: 'Presentation', points: 25, description: 'Clear communication of methods and results' }
    ]
  }
];

// Enhanced calendar events with comprehensive scheduling
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

  {
    id: 4,
    title: 'Full-Stack E-commerce Platform Due',
    type: 'assignment',
    start_date: getRelativeDate(12),
    end_date: getRelativeDate(12),
    start_time: '11:59 PM',
    course_id: 1,
    course_name: 'Advanced Web Development',
    status: 'upcoming',
    points_possible: 250,
    priority: 'high',
    description: 'Submit your complete e-commerce platform with all required features.'
  },

  // PHI101 Events
  {
    id: 5,
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
    id: 6,
    title: 'Skepticism and Certainty Quiz',
    type: 'quiz',
    start_date: getRelativeDate(3),
    end_date: getRelativeDate(3),
    start_time: '9:30 AM',
    end_time: '10:45 AM',
    course_id: 2,
    course_name: 'Introduction to Philosophy',
    status: 'upcoming',
    points_possible: 50,
    priority: 'medium',
    location: 'PHIL 120',
    description: 'Quiz on skeptical arguments and epistemological foundations.'
  },

  {
    id: 7,
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

  {
    id: 8,
    title: 'Ethical Dilemma Case Study Due',
    type: 'assignment',
    start_date: getRelativeDate(22),
    end_date: getRelativeDate(22),
    start_time: '11:59 PM',
    course_id: 2,
    course_name: 'Introduction to Philosophy',
    status: 'upcoming',
    points_possible: 100,
    priority: 'high',
    description: 'Submit your ethical analysis using major moral theories.'
  },

  // MAT265 Events
  {
    id: 9,
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
    id: 10,
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

  {
    id: 11,
    title: 'Derivative Rules Assignment Due',
    type: 'assignment',
    start_date: getRelativeDate(7),
    end_date: getRelativeDate(7),
    start_time: '11:59 PM',
    course_id: 3,
    course_name: 'Calculus I',
    status: 'upcoming',
    points_possible: 80,
    priority: 'medium',
    description: 'Submit derivative problems showing all work and explanations.'
  },

  {
    id: 12,
    title: 'Optimization Problems Project Due',
    type: 'assignment',
    start_date: getRelativeDate(16),
    end_date: getRelativeDate(16),
    start_time: '11:59 PM',
    course_id: 3,
    course_name: 'Calculus I',
    status: 'upcoming',
    points_possible: 120,
    priority: 'high',
    description: 'Submit optimization project with detailed solutions and explanations.'
  },

  // Office Hours and Special Events
  {
    id: 13,
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
  },

  {
    id: 14,
    title: 'Dr. Martinez Office Hours',
    type: 'office_hours',
    start_date: getRelativeDate(3),
    end_date: getRelativeDate(3),
    start_time: '2:00 PM',
    end_time: '4:00 PM',
    course_id: 2,
    course_name: 'Introduction to Philosophy',
    status: 'upcoming',
    location: 'ENGR 210',
    description: 'Drop-in office hours for philosophy questions and essay help.'
  },

  {
    id: 15,
    title: 'Midterm Study Session',
    type: 'lecture',
    start_date: getRelativeDate(14),
    end_date: getRelativeDate(14),
    start_time: '7:00 PM',
    end_time: '9:00 PM',
    course_id: 3,
    course_name: 'Calculus I',
    status: 'upcoming',
    location: 'MATH 315',
    description: 'Review session for upcoming midterm exam covering derivatives and applications.'
  },

  // New Courses Calendar Events (based on ASU faculty)
  {
    id: 16,
    title: 'HCI Design Principles Lecture',
    type: 'lecture',
    start_date: getRelativeDate(2),
    end_date: getRelativeDate(2),
    start_time: '2:00 PM',
    end_time: '3:15 PM',
    course_id: 10,
    course_name: 'Introduction to Human-Computer Interaction',
    status: 'upcoming',
    location: 'ENGR 240',
    description: 'Dr. Atkinson presents core HCI design principles and cognitive theories.'
  },

  {
    id: 17,
    title: 'Usability Testing Study Due',
    type: 'assignment',
    start_date: getRelativeDate(16),
    end_date: getRelativeDate(16),
    start_time: '11:59 PM',
    course_id: 10,
    course_name: 'Introduction to Human-Computer Interaction',
    status: 'upcoming',
    points_possible: 120,
    priority: 'high',
    description: 'Submit comprehensive usability study with analysis and recommendations.'
  },

  {
    id: 18,
    title: 'Microservices Workshop',
    type: 'lecture',
    start_date: getRelativeDate(3),
    end_date: getRelativeDate(3),
    start_time: '10:30 AM',
    end_time: '11:45 AM',
    course_id: 11,
    course_name: 'Distributed Software Development',
    status: 'upcoming',
    location: 'ENGR 250',
    description: 'Hands-on workshop on microservices architecture design with Dr. Chen.'
  },

  {
    id: 19,
    title: 'ML Fundamentals Quiz',
    type: 'quiz',
    start_date: getRelativeDate(6),
    end_date: getRelativeDate(6),
    start_time: '11:00 AM',
    end_time: '11:50 AM',
    course_id: 12,
    course_name: 'Introduction to Machine Learning',
    status: 'upcoming',
    points_possible: 50,
    priority: 'medium',
    location: 'ENGR 260',
    description: 'Quiz on fundamental ML concepts and terminology with Dr. Jaskie.'
  },

  {
    id: 20,
    title: 'Dr. Atkinson Office Hours',
    type: 'office_hours',
    start_date: getRelativeDate(2),
    end_date: getRelativeDate(2),
    start_time: '1:00 PM',
    end_time: '3:00 PM',
    course_id: 10,
    course_name: 'Introduction to Human-Computer Interaction',
    status: 'upcoming',
    location: 'ENGR 240',
    description: 'Office hours for HCI course questions and project guidance.'
  },

  {
    id: 21,
    title: 'Dr. Chen Office Hours',
    type: 'office_hours',
    start_date: getRelativeDate(4),
    end_date: getRelativeDate(4),
    start_time: '3:00 PM',
    end_time: '5:00 PM',
    course_id: 11,
    course_name: 'Distributed Software Development',
    status: 'upcoming',
    location: 'ENGR 250',
    description: 'Office hours for distributed systems and microservices questions.'
  },

  {
    id: 22,
    title: 'Dr. Jaskie Office Hours',
    type: 'office_hours',
    start_date: getRelativeDate(5),
    end_date: getRelativeDate(5),
    start_time: '2:00 PM',
    end_time: '4:00 PM',
    course_id: 12,
    course_name: 'Introduction to Machine Learning',
    status: 'upcoming',
    location: 'ENGR 260',
    description: 'Office hours for machine learning concepts and programming help.'
  }
];

// Comprehensive mock API with proper filtering and realistic delays
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

  async getCourse(courseIdOrSlug: number | string): Promise<Course | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (typeof courseIdOrSlug === 'number') {
      return courses.find(course => course.id === courseIdOrSlug) || null;
    } else {
      // Handle slug lookup - convert course name to slug format for comparison
      const inputSlug = courseIdOrSlug;
      return courses.find(course => slugify(course.name) === inputSlug) || null;
    }
  },

  async deleteCourse(courseId: number): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const courseIndex = courses.findIndex(course => course.id === courseId);
    if (courseIndex === -1) {
      return { success: false, error: 'Course not found' };
    }
    
    courses.splice(courseIndex, 1);
    return { success: true };
  },

  async addCourse(courseData: Course): Promise<{ success: boolean; course?: Course; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // Generate unique ID
      const maxId = Math.max(...courses.map(c => c.id), 0);
      const newCourse: Course = {
        ...courseData,
        id: maxId + 1
      };
      
      courses.push(newCourse);
      return { success: true, course: newCourse };
    } catch (error) {
      return { success: false, error: 'Failed to add course' };
    }
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

  async getAssignmentByName(courseId: number, assignmentSlug: string): Promise<Assignment | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return assignments.find(assignment => 
      assignment.course_id === courseId && slugify(assignment.name) === assignmentSlug
    ) || null;
  },

  async updateAssignmentStatus(assignmentId: number, status: 'not_started' | 'in_progress' | 'submitted' | 'graded'): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const assignmentIndex = assignments.findIndex(assignment => assignment.id === assignmentId);
    
    if (assignmentIndex !== -1) {
      assignments[assignmentIndex].status = status;
      return { success: true };
    }
    
    return { success: false };
  },

  async submitAssignment(assignmentId: number, submission: string, earnedPoints: number, feedback: string): Promise<Assignment | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const assignmentIndex = assignments.findIndex(assignment => assignment.id === assignmentId);
    
    if (assignmentIndex !== -1) {
      assignments[assignmentIndex].status = 'graded';
      assignments[assignmentIndex].grade = Math.round((earnedPoints / assignments[assignmentIndex].points_possible) * 100);
      assignments[assignmentIndex].feedback = feedback;
      assignments[assignmentIndex].submissions = (assignments[assignmentIndex].submissions || 0) + 1;
      return assignments[assignmentIndex];
    }
    
    return null;
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
  },

  // Instructor dashboard operations (for comprehensive analytics)
  async getInstructorDashboard(instructorEmail: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Get courses taught by instructor
    const instructorCourses = courses.filter(course => course.instructor_email === instructorEmail);
    
    return {
      courses: instructorCourses,
      total_students: instructorCourses.reduce((sum, course) => sum + (25 + Math.floor(Math.random() * 15)), 0),
      total_assignments: assignments.filter(a => instructorCourses.some(c => c.id === a.course_id)).length,
      pending_grading: Math.floor(Math.random() * 15) + 5,
      recent_activity: `${Math.floor(Math.random() * 50) + 20} student submissions in the last 24 hours`,
      upcoming_deadlines: assignments
        .filter(a => instructorCourses.some(c => c.id === a.course_id))
        .filter(a => new Date(a.due_at) > TODAY)
        .slice(0, 5)
    };
  },

  // Course analytics for instructor features
  async getCourseAnalytics(courseId: number) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;

    // Generate realistic analytics data
    const enrollmentCount = 20 + Math.floor(Math.random() * 25);
    const activeStudents = Math.floor(enrollmentCount * 0.8);
    const averageGrade = 78 + Math.random() * 15;
    
    // Generate realistic student performance data
    const studentNames = [
      'Emma Johnson', 'Liam Smith', 'Olivia Brown', 'Noah Davis', 'Ava Wilson',
      'Ethan Moore', 'Sophia Taylor', 'Mason Anderson', 'Isabella Thomas', 'William Jackson',
      'Mia White', 'James Harris', 'Charlotte Martin', 'Benjamin Thompson', 'Amelia Garcia',
      'Lucas Martinez', 'Harper Robinson', 'Henry Clark', 'Evelyn Rodriguez', 'Alexander Lewis'
    ];
    
    const studentPerformance = Array.from({ length: enrollmentCount }, (_, i) => {
      const grade = Math.max(40, Math.min(100, averageGrade + (Math.random() - 0.5) * 30));
      const isAtRisk = grade < 70 || Math.random() < 0.15;
      
      return {
        id: i + 1,
        name: studentNames[i % studentNames.length] + (i >= studentNames.length ? ` ${Math.floor(i / studentNames.length) + 1}` : ''),
        current_grade: Math.round(grade),
        at_risk: isAtRisk,
        last_activity: `${Math.floor(Math.random() * 7) + 1} days ago`
      };
    });

    return {
      course_id: courseId,
      course_name: course.name,
      enrollment_count: enrollmentCount,
      active_students: activeStudents,
      average_grade: Math.round(averageGrade * 10) / 10,
      completion_rate: 0.82 + Math.random() * 0.15,
      discussion_engagement: 12 + Math.random() * 8,
      assignment_submission_rate: 0.88 + Math.random() * 0.1,
      ai_detection_flags: Math.floor(Math.random() * 5),
      weekly_activity: Array.from({ length: 8 }, () => Math.floor(enrollmentCount * (15 + Math.random() * 10))),
      grade_distribution: [
        { range: 'A (90-100)', count: Math.floor(enrollmentCount * 0.25), percentage: 25 },
        { range: 'B (80-89)', count: Math.floor(enrollmentCount * 0.35), percentage: 35 },
        { range: 'C (70-79)', count: Math.floor(enrollmentCount * 0.25), percentage: 25 },
        { range: 'D (60-69)', count: Math.floor(enrollmentCount * 0.10), percentage: 10 },
        { range: 'F (0-59)', count: Math.floor(enrollmentCount * 0.05), percentage: 5 }
      ],
      risk_factors: averageGrade < 75 ? ['Below-average class performance', 'Low assignment submission rate'] : [],
      recommendations: averageGrade > 85 ? 
        ['Excellent performance - consider enrichment activities', 'Implement peer tutoring program'] : 
        ['Consider additional support for struggling students', 'Increase engagement through interactive activities'],
      student_performance: studentPerformance
    };
  },

  // Quiz operations
  async getQuizByName(courseId: number, quizSlug: string): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find the course
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;
    
    // Look through course modules for quiz items
    for (const module of course.modules) {
      for (const item of module.items) {
        if (item.type === 'quiz' && slugify(item.title) === quizSlug) {
          // Convert module item to full quiz format with questions
          return {
            id: item.id,
            name: item.title,
            description: item.content || 'Quiz to test your understanding.',
            due_at: item.due_date || getRelativeDate(7),
            course_id: courseId,
            points_possible: item.points_possible || 50,
            status: item.status || 'not_started',
            grade: item.grade,
            feedback: item.feedback,
            attempts: item.attempts || 0,
            max_attempts: item.max_attempts || 2,
            time_limit: 30, // 30 minutes default
            questions: this.getQuizQuestions(item.id, item.title)
          };
        }
      }
    }
    
    return null;
  },

  // Generate realistic quiz questions based on quiz ID and title
  getQuizQuestions(quizId: number, quizTitle: string): any[] {
    const baseQuestions: { [key: number]: any[] } = {
      // ML Fundamentals Quiz (ID: 901)
      901: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'What is the primary difference between supervised and unsupervised learning?',
          options: [
            'Supervised learning uses labeled data, unsupervised learning uses unlabeled data',
            'Supervised learning is faster than unsupervised learning',
            'Supervised learning requires more computational power',
            'There is no significant difference'
          ],
          correct_answer: 0,
          points: 5,
          explanation: 'Supervised learning algorithms learn from labeled training data to make predictions, while unsupervised learning finds patterns in unlabeled data.'
        },
        {
          id: 2,
          type: 'multiple_choice',
          question: 'Which of the following is an example of a classification problem?',
          options: [
            'Predicting house prices based on square footage',
            'Determining whether an email is spam or not spam',
            'Forecasting stock market trends',
            'Calculating the optimal route for delivery'
          ],
          correct_answer: 1,
          points: 5,
          explanation: 'Email spam detection is a binary classification problem where the output is one of two discrete categories (spam or not spam).'
        },
        {
          id: 3,
          type: 'multiple_choice',
          question: 'What is overfitting in machine learning?',
          options: [
            'When a model performs poorly on both training and test data',
            'When a model performs well on training data but poorly on test data',
            'When a model takes too long to train',
            'When a model uses too many features'
          ],
          correct_answer: 1,
          points: 5,
          explanation: 'Overfitting occurs when a model learns the training data too well, including noise and specific patterns that don\'t generalize to new data.'
        },
        {
          id: 4,
          type: 'multiple_choice',
          question: 'Which metric is most appropriate for evaluating a binary classification model with imbalanced classes?',
          options: [
            'Accuracy',
            'F1-score',
            'Mean Squared Error',
            'R-squared'
          ],
          correct_answer: 1,
          points: 5,
          explanation: 'F1-score is the harmonic mean of precision and recall, making it more suitable for imbalanced datasets than accuracy.'
        },
        {
          id: 5,
          type: 'multiple_choice',
          question: 'What is the purpose of cross-validation in machine learning?',
          options: [
            'To increase the size of the training dataset',
            'To reduce computational complexity',
            'To get a more robust estimate of model performance',
            'To automatically select features'
          ],
          correct_answer: 2,
          points: 5,
          explanation: 'Cross-validation provides a more reliable estimate of how well a model will perform on unseen data by testing it on multiple different train-test splits.'
        },
        {
          id: 6,
          type: 'multiple_choice',
          question: 'Which algorithm is typically used for clustering?',
          options: [
            'Linear Regression',
            'K-Means',
            'Logistic Regression',
            'Decision Trees'
          ],
          correct_answer: 1,
          points: 5,
          explanation: 'K-Means is an unsupervised learning algorithm specifically designed for clustering data points into groups.'
        },
        {
          id: 7,
          type: 'multiple_choice',
          question: 'What is feature engineering?',
          options: [
            'The process of selecting the best machine learning algorithm',
            'The process of creating or transforming variables to improve model performance',
            'The process of collecting more training data',
            'The process of visualizing data distributions'
          ],
          correct_answer: 1,
          points: 5,
          explanation: 'Feature engineering involves creating new features or transforming existing ones to help machine learning algorithms perform better.'
        },
        {
          id: 8,
          type: 'multiple_choice',
          question: 'What is the bias-variance tradeoff?',
          options: [
            'The relationship between model complexity and interpretability',
            'The balance between underfitting and overfitting in model performance',
            'The choice between different evaluation metrics',
            'The tradeoff between training time and accuracy'
          ],
          correct_answer: 1,
          points: 5,
          explanation: 'The bias-variance tradeoff describes how increasing model complexity (reducing bias) can lead to higher variance and potential overfitting.'
        },
        {
          id: 9,
          type: 'multiple_choice',
          question: 'Which of these is NOT a common data preprocessing step?',
          options: [
            'Handling missing values',
            'Feature scaling/normalization',
            'Gradient descent optimization',
            'Encoding categorical variables'
          ],
          correct_answer: 2,
          points: 5,
          explanation: 'Gradient descent is an optimization algorithm used during model training, not a data preprocessing step.'
        },
        {
          id: 10,
          type: 'multiple_choice',
          question: 'What is the main advantage of ensemble methods?',
          options: [
            'They are faster to train than individual models',
            'They combine multiple models to improve overall performance',
            'They require less data than single models',
            'They are easier to interpret than single models'
          ],
          correct_answer: 1,
          points: 5,
          explanation: 'Ensemble methods combine predictions from multiple models to achieve better performance than any individual model.'
        }
      ]
    };

    return baseQuestions[quizId] || [
      {
        id: 1,
        type: 'multiple_choice',
        question: 'This is a sample question for ' + quizTitle,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 0,
        points: 10,
        explanation: 'This is a sample explanation.'
      }
    ];
  },

  // Submit quiz answers and update status
  async submitQuiz(quizId: number, answers: { [key: number]: number }, score: number): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find the quiz in course modules and update its status
    for (const course of courses) {
      for (const module of course.modules) {
        for (const item of module.items) {
          if (item.type === 'quiz' && item.id === quizId) {
            item.status = 'graded';
            item.grade = score;
            item.attempts = (item.attempts || 0) + 1;
            item.feedback = `Quiz completed with score: ${score}/${item.points_possible}`;
            return { success: true };
          }
        }
      }
    }
    
    return { success: false };
  },

  // Get discussions for a course
  async getDiscussions(courseId: number): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find course by ID and return discussion items from modules
    const course = courses.find(c => c.id === courseId);
    if (!course) return [];
    
    const discussions: any[] = [];
    
    // Extract discussions from course modules
    for (const module of course.modules) {
      for (const item of module.items) {
        if (item.type === 'discussion') {
          discussions.push({
            id: item.id,
            title: item.title,
            message: item.content || '',
            course_id: courseId,
            author: course.instructor,
            created_at: item.due_date || new Date().toISOString(),
            replies: this.getDiscussionReplies(item.id),
            topic: module.name
          });
        }
      }
    }
    
    // Add default discussions for courses that don't have any
    if (discussions.length === 0) {
      discussions.push({
        id: 1000 + courseId,
        title: `Welcome to ${course.name}!`,
        message: `Welcome to ${course.name}! Please introduce yourself and share your goals for this course.`,
        course_id: courseId,
        author: course.instructor,
        created_at: course.start_date,
        replies: [],
        topic: 'General'
      });
    }
    
    return discussions;
  },

  // Get a specific discussion by slug
  async getDiscussionByName(courseId: number, discussionSlug: string): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const discussions = await this.getDiscussions(courseId);
    const { slugify } = await import('./utils');
    
    return discussions.find(d => slugify(d.title) === discussionSlug) || null;
  },

  // Additional methods for Chat component compatibility
  async getContextInfo(contextType: string, contextId?: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    switch (contextType) {
      case 'course':
        if (contextId) {
          const course = courses.find(c => c.id === contextId);
          return course ? {
            type: 'course',
            course,
            recent_announcements: [],
            upcoming_assignments: assignments.filter(a => a.course_id === contextId).slice(0, 3)
          } : null;
        }
        break;
      case 'assignment':
        if (contextId) {
          const assignment = assignments.find(a => a.id === contextId);
          return assignment ? {
            type: 'assignment',
            assignment,
            course: courses.find(c => c.id === assignment.course_id)
          } : null;
        }
        break;
      case 'dashboard':
        return {
          type: 'dashboard',
          total_courses: courses.length,
          upcoming_assignments: assignments.slice(0, 5)
        };
      default:
        return null;
    }
    return null;
  },

  async getDashboardData(userEnrollments?: string[]): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const enrollmentIds = userEnrollments ? userEnrollments.map(id => parseInt(id, 10)) : [];
    const userCourses = enrollmentIds.length > 0 ? courses.filter(c => enrollmentIds.includes(c.id)) : courses;
    const userAssignments = assignments.filter(a => userCourses.some(c => c.id === a.course_id));
    
    return {
      courses: userCourses,
      assignments: userAssignments,
      upcoming_assignments: userAssignments.filter(a => {
        const dueDate = new Date(a.due_at);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate > now && dueDate <= weekFromNow;
      }),
      recent_activity: [
        { type: 'submission', title: 'Assignment submitted', time: '2 hours ago' },
        { type: 'grade', title: 'Grade received', time: '1 day ago' },
        { type: 'announcement', title: 'New announcement', time: '3 days ago' }
      ]
    };
  },

  async getCourseAssignments(courseId: number): Promise<Assignment[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return assignments.filter(assignment => assignment.course_id === courseId);
  },

  async getDiscussion(discussionId: number): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find discussion in course modules
    for (const course of courses) {
      for (const module of course.modules) {
        for (const item of module.items) {
          if (item.type === 'discussion' && item.id === discussionId) {
            return {
              id: item.id,
              title: item.title,
              content: item.content,
              course_id: course.id,
              course_name: course.name,
              replies: this.getDiscussionReplies(item.id)
            };
          }
        }
      }
    }
    
    return null;
  },

  // Get replies for a discussion (mock data)
  getDiscussionReplies(discussionId: number): any[] {
    // Return some mock replies based on discussion ID
    const baseReplies = [
      {
        id: 1,
        message: "Great question! I'm looking forward to learning more about this topic.",
        author: "Alex Chen",
        created_at: getRelativeDate(-2),
        personality: "enthusiastic"
      },
      {
        id: 2,
        message: "I've had similar experiences in my previous courses. Happy to share insights!",
        author: "Maria Rodriguez",
        created_at: getRelativeDate(-1),
        personality: "helpful"
      }
    ];
    
    // Return different numbers of replies based on discussion ID
    if (discussionId % 3 === 0) return baseReplies;
    if (discussionId % 2 === 0) return [baseReplies[0]];
    return [];
  },

  // Authentication methods for mock API compatibility
  auth: {
    validateToken: async (token: string) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      // Mock token validation - in development, any token is valid
      if (token) {
        return {
          id: 'mock_user',
          name: 'Mock User',
          email: 'mock@example.com'
        };
      }
      return null;
    }
  }
}; 