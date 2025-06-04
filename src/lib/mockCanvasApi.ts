import { addDays, addWeeks, format, startOfMonth, subDays, subWeeks, addMonths } from 'date-fns';
import { slugify } from '@/lib/utils';

// Helper function to get semester start
function startOfSemester(date: Date): Date {
  const month = date.getMonth();
  // Summer semester starts in May (4), Fall in August (7), Spring in January (0)
  if (month >= 4 && month <= 6) return new Date(date.getFullYear(), 4, 15); // Summer starts May 15
  if (month >= 7) return new Date(date.getFullYear(), 7, 15); // Fall starts August 15
  return new Date(date.getFullYear(), 0, 15); // Spring starts January 15
}

// Helper function to generate quiz questions based on quiz topic
function generateQuizQuestions(quizId: number, quizTitle: string): any[] {
  const baseQuestions: { [key: string]: any[] } = {
    'Component Architecture Quiz': [
      {
        id: quizId * 1000 + 1,
        question: 'What is the main purpose of React hooks?',
        options: [
          'To add styling to components',
          'To enable state and lifecycle features in functional components',
          'To create class components',
          'To handle routing'
        ],
        correctAnswer: 1,
        explanation: 'React hooks allow functional components to use state and other React features that were previously only available in class components.'
      },
      {
        id: quizId * 1000 + 2,
        question: 'Which pattern helps avoid prop drilling in React?',
        options: [
          'Higher-Order Components only',
          'Context API',
          'Redux only',
          'Class components'
        ],
        correctAnswer: 1,
        explanation: 'The Context API provides a way to pass data through the component tree without having to pass props down manually at every level.'
      },
      {
        id: quizId * 1000 + 3,
        question: 'What is the benefit of using controlled components?',
        options: [
          'They are faster to render',
          'They give React control over form data',
          'They use less memory',
          'They work better with CSS'
        ],
        correctAnswer: 1,
        explanation: 'Controlled components allow React to be the single source of truth for form data, making it easier to validate and manipulate form inputs.'
      }
    ],
    'Normalization Theory Quiz': [
      {
        id: quizId * 1000 + 1,
        question: 'What is the main goal of database normalization?',
        options: [
          'To increase database size',
          'To eliminate data redundancy and improve data integrity',
          'To make queries slower',
          'To add more tables'
        ],
        correctAnswer: 1,
        explanation: 'Normalization reduces data redundancy and dependency by organizing fields and tables to minimize redundant data.'
      },
      {
        id: quizId * 1000 + 2,
        question: 'What does First Normal Form (1NF) require?',
        options: [
          'All attributes must be prime',
          'No partial dependencies',
          'Each column contains atomic (indivisible) values',
          'No transitive dependencies'
        ],
        correctAnswer: 2,
        explanation: '1NF requires that each column contains atomic values and each record is unique.'
      },
      {
        id: quizId * 1000 + 3,
        question: 'Which normal form eliminates transitive dependencies?',
        options: [
          'First Normal Form (1NF)',
          'Second Normal Form (2NF)',
          'Third Normal Form (3NF)',
          'Boyce-Codd Normal Form (BCNF)'
        ],
        correctAnswer: 2,
        explanation: '3NF eliminates transitive dependencies where non-key attributes depend on other non-key attributes.'
      }
    ],
    'Cloud Deployment Quiz': [
      {
        id: quizId * 1000 + 1,
        question: 'What is the main advantage of containerization?',
        options: [
          'Faster compilation',
          'Consistent deployment across environments',
          'Better graphics performance',
          'Lower development costs'
        ],
        correctAnswer: 1,
        explanation: 'Containers ensure that applications run consistently across different environments by packaging the application with its dependencies.'
      },
      {
        id: quizId * 1000 + 2,
        question: 'Which deployment strategy has zero downtime?',
        options: [
          'Blue-green deployment',
          'Recreate deployment',
          'Stop-and-start deployment',
          'Manual deployment'
        ],
        correctAnswer: 0,
        explanation: 'Blue-green deployment maintains two identical production environments, allowing seamless switching with zero downtime.'
      }
    ]
  };

  // Return questions for the specific quiz, or default questions if not found
  return baseQuestions[quizTitle] || [
    {
      id: quizId * 1000 + 1,
      question: 'Which of the following is a key concept in this topic?',
      options: [
        'Understanding the fundamentals',
        'Ignoring best practices',
        'Avoiding documentation',
        'Skipping testing'
      ],
      correctAnswer: 0,
      explanation: 'Understanding fundamentals is crucial for mastering any technical topic.'
    },
    {
      id: quizId * 1000 + 2,
      question: 'What is the best approach to learning new technology?',
      options: [
        'Only reading theory',
        'Practice combined with study',
        'Only hands-on practice',
        'Watching videos only'
      ],
      correctAnswer: 1,
      explanation: 'Combining theoretical understanding with practical application provides the most effective learning experience.'
    }
  ];
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

// Mock Data - Current date is June 3, 2025
const currentDate = new Date('2025-06-03');
const semesterStart = startOfSemester(currentDate); // Summer 2025 started May 15, 2025
const semesterEnd = addWeeks(semesterStart, 12); // Summer semester is 12 weeks

const currentUser: User = {
  id: 1,
  name: "John Smith",
  email: "student@example.com",
  role: "student",
  enrolled_courses: [1, 2, 3, 4]
};

const courses: Course[] = [
  {
    id: 1,
    name: 'Advanced Web Development',
    course_code: 'CS380',
    description: 'Master modern web development with React, Next.js, Node.js, and cloud deployment. Build full-stack applications using TypeScript, database integration, authentication, and real-time features.',
    instructor: 'Dr. Sarah Chen',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 87,
    start_date: '2025-05-15',
    end_date: '2025-08-08',
    syllabus: 'This intensive summer course covers advanced web development techniques including React hooks, state management, API development, database design, authentication systems, and cloud deployment strategies.',
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
            content: 'Comprehensive guide to React hooks including useState, useEffect, useContext, and custom hooks. Learn best practices and common patterns.',
            due_date: '2025-05-22T23:59:59Z',
            status: 'graded',
            points_possible: 0
          },
          {
            id: 2,
            title: 'Component Architecture Quiz',
            type: 'quiz',
            content: 'Test your understanding of React component patterns, prop drilling, and state management strategies.',
            due_date: '2025-05-27T23:59:59Z',
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
            due_date: '2025-06-02T23:59:59Z',
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
            content: 'Discuss normalization, relationships, and NoSQL vs SQL database choices for web applications. Share your project database design.',
            due_date: '2025-06-08T23:59:59Z',
            status: 'in_progress',
            points_possible: 25,
            submissions: 0,
            attempts: 0
          },
          {
            id: 5,
            title: 'REST API Development',
            type: 'assignment',
            content: 'Create a full REST API with CRUD operations, authentication middleware, and proper error handling. Use PostgreSQL or MongoDB.',
            due_date: '2025-06-15T23:59:59Z',
            status: 'not_started',
            points_possible: 150,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      },
      {
        id: 4,
        name: 'Authentication & Security',
        description: 'Implement secure authentication and authorization systems',
        is_completed: false,
        items: [
          {
            id: 6,
            title: 'JWT vs Session Auth Comparison',
            type: 'page',
            content: 'Learn the differences between JWT and session-based authentication, security considerations, and implementation best practices.',
            due_date: '2025-06-18T23:59:59Z',
            status: 'not_started',
            points_possible: 0
          },
          {
            id: 7,
            title: 'Authentication System Implementation',
            type: 'assignment',
            content: 'Build a complete authentication system with registration, login, password reset, and protected routes. Include OAuth integration.',
            due_date: '2025-06-25T23:59:59Z',
            status: 'not_started',
            points_possible: 125,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      },
      {
        id: 5,
        name: 'Real-time Features & WebSockets',
        description: 'Add real-time functionality to web applications',
        is_completed: false,
        items: [
          {
            id: 8,
            title: 'WebSocket Chat Application',
            type: 'assignment',
            content: 'Build a real-time chat application using WebSockets. Include user presence, message history, and room management.',
            due_date: '2025-07-02T23:59:59Z',
            status: 'not_started',
            points_possible: 100,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          }
        ]
      },
      {
        id: 6,
        name: 'Cloud Deployment & DevOps',
        description: 'Deploy applications to cloud platforms with proper CI/CD',
        is_completed: false,
        items: [
          {
            id: 9,
            title: 'Cloud Deployment Quiz',
            type: 'quiz',
            content: 'Test your knowledge of cloud platforms, containerization, and deployment strategies.',
            due_date: '2025-07-09T23:59:59Z',
            status: 'not_started',
            points_possible: 50,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 10,
            title: 'Final Project Deployment',
            type: 'assignment',
            content: 'Deploy your full-stack application to a cloud platform (Vercel, AWS, or Google Cloud) with proper environment configuration and monitoring.',
            due_date: '2025-07-16T23:59:59Z',
            status: 'not_started',
            points_possible: 200,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Machine Learning Fundamentals',
    course_code: 'CS485',
    description: 'Introduction to machine learning algorithms, data preprocessing, model evaluation, and practical applications using Python, scikit-learn, and TensorFlow.',
    instructor: 'Dr. Michael Rodriguez',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 91,
    start_date: '2025-05-15',
    end_date: '2025-08-08',
    syllabus: 'Comprehensive introduction to machine learning covering supervised and unsupervised learning, neural networks, deep learning basics, and real-world applications.',
    modules: [
      {
        id: 1,
        name: 'Python for Data Science',
        description: 'Essential Python libraries for machine learning',
        is_completed: true,
        items: [
          {
            id: 11,
            title: 'NumPy and Pandas Workshop',
            type: 'assignment',
            content: 'Master data manipulation with NumPy arrays and Pandas DataFrames. Complete exercises on data cleaning and exploratory data analysis.',
            due_date: '2025-05-25T23:59:59Z',
            status: 'graded',
            grade: 95,
            feedback: 'Excellent data manipulation skills demonstrated!',
            points_possible: 75,
            submissions: 1,
            attempts: 1,
            max_attempts: 2
          }
        ]
      },
      {
        id: 2,
        name: 'Supervised Learning Algorithms',
        description: 'Classification and regression techniques',
        is_completed: false,
        items: [
          {
            id: 12,
            title: 'Linear Regression Implementation',
            type: 'assignment',
            content: 'Implement linear regression from scratch and compare with scikit-learn. Analyze model performance and feature importance.',
            due_date: '2025-06-05T23:59:59Z',
            status: 'submitted',
            grade: 89,
            feedback: 'Good implementation. Consider adding regularization techniques.',
            points_possible: 100,
            submissions: 1,
            attempts: 1,
            max_attempts: 2
          },
          {
            id: 13,
            title: 'Classification Algorithms Comparison',
            type: 'assignment',
            content: 'Compare performance of different classification algorithms (SVM, Random Forest, Naive Bayes) on a real dataset.',
            due_date: '2025-06-12T23:59:59Z',
            status: 'in_progress',
            points_possible: 125,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      },
      {
        id: 3,
        name: 'Neural Networks & Deep Learning',
        description: 'Introduction to neural networks and deep learning frameworks',
        is_completed: false,
        items: [
          {
            id: 14,
            title: 'Neural Network from Scratch',
            type: 'assignment',
            content: 'Build a simple neural network from scratch using only NumPy. Train it on the MNIST digit recognition dataset.',
            due_date: '2025-06-19T23:59:59Z',
            status: 'not_started',
            points_possible: 150,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          },
          {
            id: 15,
            title: 'CNN Image Classification',
            type: 'assignment',
            content: 'Use TensorFlow/Keras to build a convolutional neural network for image classification. Experiment with different architectures.',
            due_date: '2025-06-26T23:59:59Z',
            status: 'not_started',
            points_possible: 175,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      },
      {
        id: 4,
        name: 'Unsupervised Learning',
        description: 'Clustering, dimensionality reduction, and pattern discovery',
        is_completed: false,
        items: [
          {
            id: 16,
            title: 'K-Means Clustering Project',
            type: 'assignment',
            content: 'Apply K-means clustering to customer segmentation data. Determine optimal number of clusters and interpret results.',
            due_date: '2025-07-03T23:59:59Z',
            status: 'not_started',
            points_possible: 100,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          }
        ]
      },
      {
        id: 5,
        name: 'Model Evaluation & Deployment',
        description: 'Performance metrics, validation strategies, and model deployment',
        is_completed: false,
        items: [
          {
            id: 17,
            title: 'Cross-Validation and Hyperparameter Tuning',
            type: 'assignment',
            content: 'Implement various cross-validation techniques and hyperparameter optimization strategies for model selection.',
            due_date: '2025-07-10T23:59:59Z',
            status: 'not_started',
            points_possible: 100,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 18,
            title: 'ML Model Deployment',
            type: 'assignment',
            content: 'Deploy a trained machine learning model as a REST API using Flask or FastAPI. Include proper error handling and documentation.',
            due_date: '2025-07-17T23:59:59Z',
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
  {
    id: 3,
    name: 'Database Systems Architecture',
    course_code: 'CS455',
    description: 'Advanced database concepts including distributed systems, NoSQL databases, query optimization, transaction management, and modern database architectures.',
    instructor: 'Prof. Emily Johnson',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 83,
    start_date: '2025-05-15',
    end_date: '2025-08-08',
    syllabus: 'Deep dive into database systems covering relational theory, query processing, transaction management, distributed databases, and emerging NoSQL technologies.',
    modules: [
      {
        id: 1,
        name: 'Relational Database Theory',
        description: 'Mathematical foundations of relational databases',
        is_completed: true,
        items: [
          {
            id: 19,
            title: 'Normalization Theory Quiz',
            type: 'quiz',
            content: 'Test your understanding of database normalization forms (1NF, 2NF, 3NF, BCNF) and functional dependencies.',
            due_date: '2025-05-28T23:59:59Z',
            status: 'graded',
            grade: 78,
            feedback: 'Good grasp of normalization. Review BCNF concepts.',
            points_possible: 50,
            submissions: 1,
            attempts: 1,
            max_attempts: 2
          }
        ]
      },
      {
        id: 2,
        name: 'Query Optimization',
        description: 'SQL query performance and optimization techniques',
        is_completed: false,
        items: [
          {
            id: 20,
            title: 'Query Performance Analysis',
            type: 'assignment',
            content: 'Analyze and optimize complex SQL queries. Use execution plans and indexing strategies to improve performance.',
            due_date: '2025-06-07T23:59:59Z',
            status: 'in_progress',
            points_possible: 100,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          },
          {
            id: 21,
            title: 'Index Design Project',
            type: 'assignment',
            content: 'Design and implement optimal indexing strategies for a given database schema. Measure performance improvements.',
            due_date: '2025-06-14T23:59:59Z',
            status: 'not_started',
            points_possible: 125,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      },
      {
        id: 3,
        name: 'Transaction Management',
        description: 'ACID properties, concurrency control, and recovery',
        is_completed: false,
        items: [
          {
            id: 22,
            title: 'Concurrency Control Simulation',
            type: 'assignment',
            content: 'Implement different concurrency control mechanisms (2PL, timestamp ordering) and compare their performance.',
            due_date: '2025-06-21T23:59:59Z',
            status: 'not_started',
            points_possible: 150,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      },
      {
        id: 4,
        name: 'NoSQL and Distributed Databases',
        description: 'Modern database architectures and distributed systems',
        is_completed: false,
        items: [
          {
            id: 23,
            title: 'MongoDB vs PostgreSQL Comparison',
            type: 'assignment',
            content: 'Compare document-based (MongoDB) and relational (PostgreSQL) databases for a specific use case. Include performance benchmarks.',
            due_date: '2025-06-28T23:59:59Z',
            status: 'not_started',
            points_possible: 125,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 24,
            title: 'Distributed Database Design',
            type: 'assignment',
            content: 'Design a distributed database system with proper sharding, replication, and consistency guarantees.',
            due_date: '2025-07-05T23:59:59Z',
            status: 'not_started',
            points_possible: 175,
            submissions: 0,
            attempts: 0,
            max_attempts: 3
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Software Engineering Capstone',
    course_code: 'CS499',
    description: 'Culminating project course where students work in teams to design, develop, and deploy a large-scale software system using industry best practices.',
    instructor: 'Dr. James Wilson',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 94,
    start_date: '2025-05-15',
    end_date: '2025-08-08',
    syllabus: 'Team-based capstone project incorporating software engineering principles, project management, version control, testing, and deployment in a real-world development environment.',
    modules: [
      {
        id: 1,
        name: 'Project Planning & Requirements',
        description: 'Project proposal, requirements gathering, and team formation',
        is_completed: true,
        items: [
          {
            id: 25,
            title: 'Project Proposal Presentation',
            type: 'assignment',
            content: 'Present your team\'s capstone project proposal including problem statement, technical approach, timeline, and team roles.',
            due_date: '2025-05-23T23:59:59Z',
            status: 'graded',
            grade: 96,
            feedback: 'Excellent project scope and clear technical approach. Looking forward to seeing the implementation!',
            points_possible: 100,
            submissions: 1,
            attempts: 1,
            max_attempts: 1
          }
        ]
      },
      {
        id: 2,
        name: 'System Architecture & Design',
        description: 'Technical architecture, database design, and API specifications',
        is_completed: true,
        items: [
          {
            id: 26,
            title: 'Architecture Design Document',
            type: 'assignment',
            content: 'Create comprehensive system architecture documentation including component diagrams, API specifications, and database schema.',
            due_date: '2025-05-30T23:59:59Z',
            status: 'graded',
            grade: 92,
            feedback: 'Solid architecture design. Consider adding more detail on scalability considerations.',
            points_possible: 125,
            submissions: 1,
            attempts: 1,
            max_attempts: 2
          }
        ]
      },
      {
        id: 3,
        name: 'Implementation Sprint 1',
        description: 'Core functionality development and testing',
        is_completed: false,
        items: [
          {
            id: 27,
            title: 'Sprint 1 Deliverable',
            type: 'assignment',
            content: 'Deliver core application features with proper testing, documentation, and code review. Include deployment to staging environment.',
            due_date: '2025-06-13T23:59:59Z',
            status: 'in_progress',
            points_possible: 200,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          }
        ]
      },
      {
        id: 4,
        name: 'Implementation Sprint 2',
        description: 'Advanced features and integration testing',
        is_completed: false,
        items: [
          {
            id: 28,
            title: 'Sprint 2 Deliverable',
            type: 'assignment',
            content: 'Complete advanced features, integration with external APIs, comprehensive testing suite, and performance optimization.',
            due_date: '2025-06-27T23:59:59Z',
            status: 'not_started',
            points_possible: 200,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          }
        ]
      },
      {
        id: 5,
        name: 'Final Deployment & Presentation',
        description: 'Production deployment and project demonstration',
        is_completed: false,
        items: [
          {
            id: 29,
            title: 'Production Deployment',
            type: 'assignment',
            content: 'Deploy application to production environment with proper monitoring, logging, and backup systems in place.',
            due_date: '2025-07-11T23:59:59Z',
            status: 'not_started',
            points_possible: 150,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 30,
            title: 'Final Project Presentation',
            type: 'assignment',
            content: 'Present completed capstone project to faculty panel and industry professionals. Include technical demo and project retrospective.',
            due_date: '2025-07-18T23:59:59Z',
            status: 'not_started',
            points_possible: 125,
            submissions: 0,
            attempts: 0,
            max_attempts: 1
          }
        ]
      }
    ]
  }
];

// Generate assignments from course modules
const assignments: Assignment[] = courses.flatMap(course => 
  course.modules.flatMap(module => 
    module.items
      .filter(item => item.type === 'assignment' || item.type === 'quiz')
      .map(item => ({
        id: item.id,
        name: item.title,
        description: item.content || '',
        due_at: item.due_date || '',
        course_id: course.id,
        points_possible: item.points_possible || 0,
        status: item.status,
        grade: item.grade,
        feedback: item.feedback,
        submissions: item.submissions || 0,
        attempts: item.attempts || 0,
        max_attempts: item.max_attempts || 1,
        module_id: module.id
      }))
  )
);

const calendarEvents: CalendarEvent[] = [
  // Assignment Events
  ...assignments.map(assignment => ({
    id: assignment.id,
    title: assignment.name,
    type: assignment.name.toLowerCase().includes('quiz') ? 'quiz' as const : 'assignment' as const,
    start_date: assignment.due_at.split('T')[0],
    end_date: assignment.due_at.split('T')[0],
    course_id: assignment.course_id,
    course_name: courses.find(c => c.id === assignment.course_id)?.name || '',
    status: assignment.status,
    points_possible: assignment.points_possible,
    grade: assignment.grade
  })),

  // Module completion events
  ...courses.flatMap(course => 
    course.modules.map(module => ({
      id: 1000 + module.id + (course.id * 100),
      title: `${module.name} - ${course.course_code}`,
      type: 'module' as const,
      start_date: module.due_date ? module.due_date.split('T')[0] : format(addDays(new Date(course.start_date), module.id * 7), 'yyyy-MM-dd'),
      end_date: module.due_date ? module.due_date.split('T')[0] : format(addDays(new Date(course.start_date), module.id * 7), 'yyyy-MM-dd'),
      course_id: course.id,
      course_name: course.name,
      status: module.is_completed ? 'graded' as const : 'not_started' as const
    }))
  ),

  // Additional upcoming events for Summer 2025
  {
    id: 2001,
    title: "Summer Break",
    type: 'module' as const,
    start_date: '2025-08-09',
    end_date: '2025-08-09',
    course_id: 0,
    course_name: 'University Calendar',
    status: 'not_started' as const
  },
  {
    id: 2002,
    title: "Fall 2025 Registration Opens",
    type: 'module' as const,
    start_date: '2025-07-01',
    end_date: '2025-07-01',
    course_id: 0,
    course_name: 'University Calendar',
    status: 'not_started' as const
  }
];

// API Functions
export const mockCanvasApi = {
  // User functions
  getCurrentUser: () => Promise.resolve(currentUser),

  // Course functions
  getCourses: () => Promise.resolve(courses),
  getCourse: (idOrSlug: number | string) => {
    if (typeof idOrSlug === 'number') {
      return Promise.resolve(courses.find(course => course.id === idOrSlug) || null);
    } else {
      // Handle slug lookup
      return Promise.resolve(courses.find(course => slugify(course.name) === idOrSlug) || null);
    }
  },
  
  // Assignment functions
  getAssignments: () => Promise.resolve(assignments),
  getAssignment: (id: number) => Promise.resolve(assignments.find(assignment => assignment.id === id) || null),
  getCourseAssignments: (courseId: number) => Promise.resolve(assignments.filter(assignment => assignment.course_id === courseId)),
  getAssignmentByName: (courseId: number, assignmentSlug: string) => {
    const courseAssignments = assignments.filter(assignment => assignment.course_id === courseId);
    const assignment = courseAssignments.find(a => slugify(a.name) === assignmentSlug);
    return Promise.resolve(assignment || null);
  },
  
  getQuizByName: (courseId: number, quizSlug: string) => {
    const courseModules = courses.find(c => c.id === courseId)?.modules || [];
    const allItems = courseModules.flatMap(m => m.items);
    const quizItem = allItems.find(item => item.type === 'quiz' && slugify(item.title) === quizSlug);
    
    if (!quizItem) return Promise.resolve(null);
    
    // Convert module item to full quiz with questions
    const quiz = {
      id: quizItem.id,
      name: quizItem.title,
      description: quizItem.content || 'Take this quiz to test your knowledge.',
      due_at: quizItem.due_date || '',
      course_id: courseId,
      points_possible: quizItem.points_possible || 50,
      status: quizItem.status || 'not_started',
      grade: quizItem.grade,
      feedback: quizItem.feedback,
      attempts: quizItem.attempts || 0,
      max_attempts: quizItem.max_attempts || 2,
      time_limit: 30, // 30 minutes
      questions: generateQuizQuestions(quizItem.id, quizItem.title)
    };
    
    return Promise.resolve(quiz);
  },
  
  submitQuiz: (quizId: number, answers: { [key: number]: number }, score: number) => {
    // Find the quiz item in the modules and update its status
    for (const course of courses) {
      for (const module of course.modules) {
        const quizItem = module.items.find(item => item.id === quizId);
        if (quizItem) {
          quizItem.status = 'graded';
          quizItem.grade = score;
          quizItem.attempts = (quizItem.attempts || 0) + 1;
          return Promise.resolve({ success: true, score });
        }
      }
    }
    return Promise.reject(new Error('Quiz not found'));
  },
  
  updateAssignmentStatus: (assignmentId: number, status: Assignment['status']) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return Promise.reject(new Error('Assignment not found'));
    assignment.status = status;
    return Promise.resolve(assignment);
  },
  
  // Calendar functions
  getCalendarEvents: (startDate?: string, endDate?: string) => {
    let events = [...calendarEvents];
    
    if (startDate) {
      events = events.filter(event => event.start_date >= startDate);
    }
    
    if (endDate) {
      events = events.filter(event => event.end_date <= endDate);
    }
    
    return Promise.resolve(events.sort((a, b) => a.start_date.localeCompare(b.start_date)));
  },
  
  // Module functions
  getCourseModules: (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return Promise.resolve(course?.modules || []);
  },
  
  getModuleItems: (courseId: number, moduleId: number) => {
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    return Promise.resolve(module?.items || []);
  },

  // Dashboard data
  getDashboardData: () => {
    const upcomingAssignments = assignments
      .filter(assignment => {
        const dueDate = new Date(assignment.due_at);
        const today = new Date(currentDate);
        const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDiff >= 0 && daysDiff <= 14 && assignment.status !== 'graded'; // Next 2 weeks
      })
      .sort((a, b) => a.due_at.localeCompare(b.due_at))
      .slice(0, 5);

    const recentEvents = calendarEvents
      .filter(event => {
        const eventDate = new Date(event.start_date);
        const today = new Date(currentDate);
        const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDiff >= -7 && daysDiff <= 7; // Past week to next week
      })
      .sort((a, b) => a.start_date.localeCompare(b.start_date));

    return Promise.resolve({
      courses: courses.map(course => ({
        ...course,
        progress: Math.round((course.modules.filter(m => m.is_completed).length / course.modules.length) * 100)
      })),
      upcomingAssignments,
      recentEvents,
      currentUser
    });
  },

  // Search function for context-aware chat
  searchContent: (query: string, context?: { type: string; id?: number }) => {
    const results = [];
    
    if (!context || context.type === 'dashboard') {
      // Search all content
      for (const course of courses) {
        if (course.name.toLowerCase().includes(query.toLowerCase()) || 
            course.description.toLowerCase().includes(query.toLowerCase())) {
          results.push({ ...course, resultType: 'course' });
        }
        
        for (const module of course.modules) {
          if (module.name.toLowerCase().includes(query.toLowerCase()) || 
              module.description.toLowerCase().includes(query.toLowerCase())) {
            results.push({ ...module, resultType: 'module', courseName: course.name });
          }
          
          for (const item of module.items) {
            if (item.title.toLowerCase().includes(query.toLowerCase()) || 
                (item.content && item.content.toLowerCase().includes(query.toLowerCase()))) {
              results.push({ ...item, resultType: 'assignment', courseName: course.name, moduleName: module.name });
            }
          }
        }
      }
    } else if (context.type === 'course' && context.id) {
      // Search within specific course
      const course = courses.find(c => c.id === context.id);
      if (course) {
        for (const module of course.modules) {
          if (module.name.toLowerCase().includes(query.toLowerCase()) || 
              module.description.toLowerCase().includes(query.toLowerCase())) {
            results.push({ ...module, resultType: 'module', courseName: course.name });
          }
          
          for (const item of module.items) {
            if (item.title.toLowerCase().includes(query.toLowerCase()) || 
                (item.content && item.content.toLowerCase().includes(query.toLowerCase()))) {
              results.push({ ...item, resultType: 'assignment', courseName: course.name, moduleName: module.name });
            }
          }
        }
      }
    } else if (context.type === 'assignment' && context.id) {
      // Search for specific assignment context
      const assignment = assignments.find(a => a.id === context.id);
      if (assignment) {
        const course = courses.find(c => c.id === assignment.course_id);
        const module = course?.modules.find(m => m.items.some(item => item.id === assignment.id));
        results.push({ 
          ...assignment,
          resultType: 'assignment', 
          courseName: course?.name,
          moduleName: module?.name 
        });
      }
    } else if (context.type === 'calendar') {
      // Search calendar events
      const matchingEvents = calendarEvents.filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.course_name.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...matchingEvents.map(event => ({ ...event, resultType: 'calendar' })));
    }
    
    return Promise.resolve(results.slice(0, 10)); // Limit to 10 results
  },

  // Get context information for chat
  getContextInfo: (type: string, id?: number) => {
    switch (type) {
      case 'course':
        if (id) {
          const course = courses.find(c => c.id === id);
          return Promise.resolve(course ? {
            title: course.name,
            description: course.description,
            instructor: course.instructor,
            modules: course.modules.length,
            completedModules: course.modules.filter(m => m.is_completed).length,
            assignments: assignments.filter(a => a.course_id === id).length,
            upcomingAssignments: assignments.filter(a => a.course_id === id && a.status !== 'graded' && new Date(a.due_at) > currentDate).length
          } : null);
        }
        break;
        
      case 'assignment':
        if (id) {
          const assignment = assignments.find(a => a.id === id);
          if (assignment) {
            const course = courses.find(c => c.id === assignment.course_id);
            return Promise.resolve({
              title: assignment.name,
              description: assignment.description,
              dueDate: assignment.due_at,
              points: assignment.points_possible,
              status: assignment.status,
              courseName: course?.name,
              attempts: assignment.attempts,
              maxAttempts: assignment.max_attempts
            });
          }
        }
        break;
        
      case 'dashboard':
        return Promise.resolve({
          title: 'Dashboard Overview',
          totalCourses: courses.length,
          totalAssignments: assignments.length,
          pendingAssignments: assignments.filter(a => a.status === 'not_started' || a.status === 'in_progress').length,
          upcomingDeadlines: assignments.filter(a => {
            const dueDate = new Date(a.due_at);
            const daysDiff = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
            return daysDiff >= 0 && daysDiff <= 7;
          }).length
        });
        
      case 'calendar':
        return Promise.resolve({
          title: 'Calendar View',
          totalEvents: calendarEvents.length,
          upcomingEvents: calendarEvents.filter(e => new Date(e.start_date) > currentDate).length,
          thisWeekEvents: calendarEvents.filter(e => {
            const eventDate = new Date(e.start_date);
            const daysDiff = Math.ceil((eventDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
            return daysDiff >= 0 && daysDiff <= 7;
          }).length
        });
        
      default:
        return Promise.resolve(null);
    }
  }
}; 