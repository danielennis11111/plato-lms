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
    end_date: '2025-08-15',
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
  },
  {
    id: 5,
    name: 'Introduction to Literature',
    course_code: 'ENG101',
    description: 'Foundation course exploring diverse literary genres, critical reading skills, and analysis techniques. Students will engage with poetry, fiction, drama, and essays from various time periods and cultures.',
    instructor: 'Dr. Margaret Thompson',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 0,
    start_date: '2025-05-15',
    end_date: '2025-08-15',
    syllabus: 'This introductory course develops critical reading and analytical writing skills through close examination of literary texts. Students will learn to identify themes, literary devices, and cultural contexts while developing their own interpretive voice.',
    modules: [
      {
        id: 1,
        name: 'Introduction to Literary Analysis',
        description: 'Fundamentals of close reading and literary terminology',
        is_completed: false,
        items: [
          {
            id: 101,
            title: 'What is Literature? Discussion',
            type: 'discussion',
            content: 'Introduce yourself and share your definition of literature. What makes a text "literary"? Discuss with examples from your reading experience.',
            due_date: '2025-05-25T23:59:59Z',
            status: 'not_started',
            points_possible: 25,
            submissions: 0,
            attempts: 0
          },
          {
            id: 102,
            title: 'Literary Terms Quiz',
            type: 'quiz',
            content: 'Test your knowledge of basic literary terms and devices including metaphor, symbolism, irony, and narrative perspective.',
            due_date: '2025-06-01T23:59:59Z',
            status: 'not_started',
            points_possible: 50,
            attempts: 0,
            max_attempts: 2
          }
        ]
      },
      {
        id: 2,
        name: 'Poetry and Form',
        description: 'Exploring poetic devices, meter, and diverse poetic traditions',
        is_completed: false,
        items: [
          {
            id: 103,
            title: 'Poetry Analysis Essay',
            type: 'assignment',
            content: 'Write a 750-word analysis of either Emily Dickinson\'s "Because I could not stop for Death" or Robert Frost\'s "The Road Not Taken." Focus on how poetic devices create meaning.',
            due_date: '2025-06-15T23:59:59Z',
            status: 'not_started',
            points_possible: 100,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 104,
            title: 'Modern Poetry Discussion',
            type: 'discussion',
            content: 'Compare traditional and contemporary poetry. Choose one poem from our anthology and one contemporary poem (2000+) and discuss how they handle similar themes.',
            due_date: '2025-06-22T23:59:59Z',
            status: 'not_started',
            points_possible: 30,
            submissions: 0,
            attempts: 0
          }
        ]
      },
      {
        id: 3,
        name: 'Short Fiction Analysis',
        description: 'Elements of storytelling: character, plot, setting, and theme',
        is_completed: false,
        items: [
          {
            id: 105,
            title: 'Character Development Essay',
            type: 'assignment',
            content: 'Analyze character development in either Alice Walker\'s "Everyday Use" or James Joyce\'s "Araby." How does the author reveal character through action, dialogue, and internal conflict?',
            due_date: '2025-07-06T23:59:59Z',
            status: 'not_started',
            points_possible: 125,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 106,
            title: 'Symbolism in Short Fiction Quiz',
            type: 'quiz',
            content: 'Identify and interpret symbolic elements in the short stories we\'ve read. Focus on how symbols contribute to theme and meaning.',
            due_date: '2025-07-13T23:59:59Z',
            status: 'not_started',
            points_possible: 60,
            attempts: 0,
            max_attempts: 2
          }
        ]
      },
      {
        id: 4,
        name: 'Drama and Performance',
        description: 'Understanding theatrical elements and dramatic interpretation',
        is_completed: false,
        items: [
          {
            id: 107,
            title: 'Scene Performance Project',
            type: 'assignment',
            content: 'In groups of 2-3, perform a scene from either Shakespeare\'s "Romeo and Juliet" or Lorraine Hansberry\'s "A Raisin in the Sun." Include a written reflection on your interpretation choices.',
            due_date: '2025-07-25T23:59:59Z',
            status: 'not_started',
            points_possible: 150,
            submissions: 0,
            attempts: 0,
            max_attempts: 1
          },
          {
            id: 108,
            title: 'Dramatic Techniques Discussion',
            type: 'discussion',
            content: 'How do playwrights use stage directions, dialogue, and dramatic irony differently than fiction writers? Use specific examples from our readings.',
            due_date: '2025-08-01T23:59:59Z',
            status: 'not_started',
            points_possible: 35,
            submissions: 0,
            attempts: 0
          }
        ]
      },
      {
        id: 5,
        name: 'Cultural Contexts and Perspectives',
        description: 'Literature as reflection of society, culture, and historical moment',
        is_completed: false,
        items: [
          {
            id: 109,
            title: 'Cultural Context Research Paper',
            type: 'assignment',
            content: 'Choose one text from our course and research its historical/cultural context. Write a 1000-word paper explaining how understanding this context enriches interpretation of the work.',
            due_date: '2025-08-08T23:59:59Z',
            status: 'not_started',
            points_possible: 175,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 110,
            title: 'Diverse Voices Discussion',
            type: 'discussion',
            content: 'Reflect on how authors from different backgrounds (race, gender, class, nationality) bring unique perspectives to universal themes. Choose two authors to compare.',
            due_date: '2025-08-12T23:59:59Z',
            status: 'not_started',
            points_possible: 40,
            submissions: 0,
            attempts: 0
          }
        ]
      },
      {
        id: 6,
        name: 'Final Projects and Reflection',
        description: 'Synthesis of learning and personal literary analysis',
        is_completed: false,
        items: [
          {
            id: 111,
            title: 'Portfolio Reflection Essay',
            type: 'assignment',
            content: 'Write a reflective essay analyzing your growth as a reader and writer this semester. Include examples from your work and discuss how your understanding of literature has evolved.',
            due_date: '2025-08-15T23:59:59Z',
            status: 'not_started',
            points_possible: 100,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 112,
            title: 'Final Comprehensive Analysis',
            type: 'assignment',
            content: 'Choose any text from our course for an in-depth 1200-word analysis incorporating multiple critical approaches (historical, feminist, formalist, etc.). Demonstrate mastery of analytical skills.',
            due_date: '2025-08-15T23:59:59Z',
            status: 'not_started',
            points_possible: 200,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          }
        ]
      }
    ]
  },
  {
    id: 6,
    name: 'Composition and Rhetoric',
    course_code: 'ENG102',
    description: 'Advanced writing course focusing on argumentation, research methods, and rhetorical analysis. Students develop skills in critical thinking, academic writing, and multimedia composition.',
    instructor: 'Prof. David Martinez',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 0,
    start_date: '2025-05-15',
    end_date: '2025-08-15',
    syllabus: 'This course emphasizes the writing process, from invention to revision, while introducing students to academic research and citation. Students will compose various forms of academic and public writing.',
    modules: [
      {
        id: 1,
        name: 'Foundations of Academic Writing',
        description: 'Writing process, thesis development, and paragraph structure',
        is_completed: false,
        items: [
          {
            id: 201,
            title: 'Personal Narrative Essay',
            type: 'assignment',
            content: 'Write a 500-word personal narrative that demonstrates your relationship with writing. Use concrete details and reflection to show how your writing has developed.',
            due_date: '2025-05-29T23:59:59Z',
            status: 'not_started',
            points_possible: 75,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 202,
            title: 'Thesis Statement Workshop',
            type: 'discussion',
            content: 'Post three potential thesis statements for different essay types (argumentative, analytical, expository) and provide feedback on classmates\' thesis statements.',
            due_date: '2025-06-05T23:59:59Z',
            status: 'not_started',
            points_possible: 25,
            submissions: 0,
            attempts: 0
          }
        ]
      },
      {
        id: 2,
        name: 'Rhetorical Analysis',
        description: 'Understanding audience, purpose, and persuasive strategies',
        is_completed: false,
        items: [
          {
            id: 203,
            title: 'Rhetorical Analysis Essay',
            type: 'assignment',
            content: 'Analyze the rhetorical strategies in a speech, advertisement, or article of your choice. Examine how the author uses ethos, pathos, and logos to persuade their audience. 750 words.',
            due_date: '2025-06-19T23:59:59Z',
            status: 'not_started',
            points_possible: 125,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 204,
            title: 'Visual Rhetoric Analysis',
            type: 'assignment',
            content: 'Analyze how a visual text (infographic, poster, meme, etc.) uses design elements to convey meaning and persuade viewers. Include the image and 400-word analysis.',
            due_date: '2025-06-26T23:59:59Z',
            status: 'not_started',
            points_possible: 100,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          }
        ]
      },
      {
        id: 3,
        name: 'Research and Documentation',
        description: 'Information literacy, source evaluation, and citation practices',
        is_completed: false,
        items: [
          {
            id: 205,
            title: 'Source Evaluation Exercise',
            type: 'assignment',
            content: 'Find 5 sources on a controversial topic. Evaluate each source\'s credibility, bias, and usefulness. Explain your evaluation criteria in a 600-word analysis.',
            due_date: '2025-07-10T23:59:59Z',
            status: 'not_started',
            points_possible: 100,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 206,
            title: 'MLA Citation Quiz',
            type: 'quiz',
            content: 'Test your knowledge of MLA citation format for various source types including books, articles, websites, and multimedia sources.',
            due_date: '2025-07-17T23:59:59Z',
            status: 'not_started',
            points_possible: 50,
            attempts: 0,
            max_attempts: 3
          }
        ]
      },
      {
        id: 4,
        name: 'Argumentative Writing',
        description: 'Constructing logical arguments and addressing counterarguments',
        is_completed: false,
        items: [
          {
            id: 207,
            title: 'Position Paper',
            type: 'assignment',
            content: 'Write a 1000-word argumentative essay on a current social issue. Use at least 4 credible sources and address potential counterarguments. Focus on logical reasoning and evidence.',
            due_date: '2025-07-30T23:59:59Z',
            status: 'not_started',
            points_possible: 175,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 208,
            title: 'Peer Review Workshop',
            type: 'discussion',
            content: 'Review two classmates\' position paper drafts using our peer review criteria. Provide constructive feedback on argument structure, evidence, and counterargument handling.',
            due_date: '2025-08-05T23:59:59Z',
            status: 'not_started',
            points_possible: 40,
            submissions: 0,
            attempts: 0
          }
        ]
      },
      {
        id: 5,
        name: 'Multimodal Composition',
        description: 'Digital literacy and multimedia writing projects',
        is_completed: false,
        items: [
          {
            id: 209,
            title: 'Digital Story Project',
            type: 'assignment',
            content: 'Create a 3-5 minute digital story combining text, images, audio, and/or video to argue for a solution to a local community problem. Include a 500-word reflection on your design choices.',
            due_date: '2025-08-12T23:59:59Z',
            status: 'not_started',
            points_possible: 150,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          }
        ]
      },
      {
        id: 6,
        name: 'Portfolio and Reflection',
        description: 'Assembling and reflecting on semester\'s writing development',
        is_completed: false,
        items: [
          {
            id: 210,
            title: 'Writing Portfolio',
            type: 'assignment',
            content: 'Compile a portfolio of your best revised work from the semester. Include a 750-word reflective introduction analyzing your growth as a writer and the choices you made in revision.',
            due_date: '2025-08-15T23:59:59Z',
            status: 'not_started',
            points_possible: 125,
            submissions: 0,
            attempts: 0,
            max_attempts: 2
          },
          {
            id: 211,
            title: 'Final Reflection Discussion',
            type: 'discussion',
            content: 'Share one key insight about writing you\'ve gained this semester and one goal for your continued development as a writer. Respond thoughtfully to classmates\' reflections.',
            due_date: '2025-08-15T23:59:59Z',
            status: 'not_started',
            points_possible: 30,
            submissions: 0,
            attempts: 0
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

  // Course functions - now accepts user enrollment data for filtering
  getCourses: (userEnrollments?: string[]) => {
    if (!userEnrollments || userEnrollments.length === 0) {
      // For users with no enrollments, provide sample courses for testing API functionality
      // Only show the first 2 courses as demo/sample courses
      const sampleCourses = courses.slice(0, 2).map(course => ({
        ...course,
        name: `[SAMPLE] ${course.name}`,
        description: `This is a sample course for testing. ${course.description}`,
      }));
      return Promise.resolve(sampleCourses);
    }
    
    // Filter courses based on user enrollments
    const enrolledCourses = courses.filter(course => 
      userEnrollments.includes(course.id.toString())
    );
    
    return Promise.resolve(enrolledCourses);
  },
  
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
  getDashboardData: (userEnrollments?: string[]) => {
    if (!userEnrollments || userEnrollments.length === 0) {
      // For users with no enrollments, provide sample data for testing
      const sampleCourses = courses.slice(0, 2).map(course => ({
        ...course,
        name: `[SAMPLE] ${course.name}`,
        description: `This is a sample course for testing. ${course.description}`,
        progress: Math.round((course.modules.filter(m => m.is_completed).length / course.modules.length) * 100)
      }));

      // Get assignments from sample courses only
      const sampleAssignments = assignments.filter(assignment => 
        assignment.course_id <= 2 // Only from first 2 courses
      );

      const upcomingAssignments = sampleAssignments
        .filter(assignment => {
          const dueDate = new Date(assignment.due_at);
          const today = new Date(currentDate);
          const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
          return daysDiff >= 0 && daysDiff <= 14 && assignment.status !== 'graded'; // Next 2 weeks
        })
        .sort((a, b) => a.due_at.localeCompare(b.due_at))
        .slice(0, 5);

      // Get calendar events from sample courses
      const sampleCalendarEvents = calendarEvents.filter(event => 
        event.course_id <= 2 || event.course_id === 0 // Sample courses + university events
      );

      const recentEvents = sampleCalendarEvents
        .filter(event => {
          const eventDate = new Date(event.start_date);
          const today = new Date(currentDate);
          const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
          return daysDiff >= -7 && daysDiff <= 7; // Past week to next week
        })
        .sort((a, b) => a.start_date.localeCompare(b.start_date));

      return Promise.resolve({
        courses: sampleCourses,
        upcomingAssignments,
        recentEvents,
        currentUser
      });
    }

    // Filter courses based on user enrollments
    const userCourses = courses.filter(course => 
      userEnrollments.includes(course.id.toString())
    );

    // Filter assignments to only those from enrolled courses
    const userAssignments = assignments.filter(assignment => 
      userCourses.some(course => course.id === assignment.course_id)
    );

    const upcomingAssignments = userAssignments
      .filter(assignment => {
        const dueDate = new Date(assignment.due_at);
        const today = new Date(currentDate);
        const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDiff >= 0 && daysDiff <= 14 && assignment.status !== 'graded'; // Next 2 weeks
      })
      .sort((a, b) => a.due_at.localeCompare(b.due_at))
      .slice(0, 5);

    // Filter calendar events to only those from enrolled courses
    const userCalendarEvents = calendarEvents.filter(event => 
      userCourses.some(course => course.id === event.course_id) || event.course_id === 0 // Keep university events
    );

    const recentEvents = userCalendarEvents
      .filter(event => {
        const eventDate = new Date(event.start_date);
        const today = new Date(currentDate);
        const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDiff >= -7 && daysDiff <= 7; // Past week to next week
      })
      .sort((a, b) => a.start_date.localeCompare(b.start_date));

    return Promise.resolve({
      courses: userCourses.map(course => ({
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
    if (type === 'assignment' && id) {
      return mockCanvasApi.getAssignment(id);
    } else if (type === 'course' && id) {
      return mockCanvasApi.getCourse(id);
    } else if (type === 'dashboard') {
      return mockCanvasApi.getDashboardData();
    } else if (type === 'quiz' && id) {
      // Find quiz in course modules
      for (const course of courses) {
        for (const module of course.modules) {
          const quizItem = module.items.find(item => item.id === id && item.type === 'quiz');
          if (quizItem) {
            return Promise.resolve({
              id: quizItem.id,
              title: quizItem.title,
              description: quizItem.content,
              status: quizItem.status,
              grade: quizItem.grade,
              feedback: quizItem.feedback,
              attempts: quizItem.attempts,
              max_attempts: quizItem.max_attempts,
              course_name: course.name,
              module_name: module.name
            });
          }
        }
      }
      return Promise.resolve(null);
    } else if (type === 'discussion' && id) {
      return mockCanvasApi.getDiscussion(id);
    }
    return Promise.resolve(null);
  },

  // Discussion endpoints
  getDiscussions: async (courseId: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const discussionPersonalities = [
      { name: 'Alex Chen', personality: 'intj', traits: 'analytical, direct, strategic' },
      { name: 'Maria Rodriguez', personality: 'enfp', traits: 'enthusiastic, creative, encouraging' },
      { name: 'Jordan Kim', personality: 'istj', traits: 'methodical, reliable, structured' },
      { name: 'Sam Taylor', personality: 'esfj', traits: 'supportive, collaborative, empathetic' },
      { name: 'Casey Park', personality: 'entp', traits: 'innovative, curious, debate-loving' },
      { name: 'River Jones', personality: 'infp', traits: 'thoughtful, value-driven, creative' },
      { name: 'Taylor Johnson', personality: 'enfp', traits: 'creative, passionate, empathetic' }
    ];
    
    // Course-specific discussions
    if (courseId === 5) { // Introduction to Literature
      return [
        {
          id: 101,
          title: "What is Literature? Discussion",
          message: "Welcome to our first discussion! Please introduce yourself and share your definition of literature. What makes a text 'literary' in your opinion? Feel free to use examples from your own reading experience - whether it's novels, poetry, plays, or even song lyrics that have moved you. There's no wrong answer here; I'm interested in hearing your unique perspectives as we begin our journey together this semester.",
          course_id: courseId,
          author: "Dr. Margaret Thompson",
          created_at: "2025-05-20T09:00:00Z",
          topic: "literary-definition",
          replies: [
            {
              id: 1,
              message: "Hi everyone! I'm Taylor, an English major passionate about how literature helps us understand different perspectives. To me, literature is writing that makes us think deeply about human experience - it could be a classic novel, a powerful poem, or even a song that tells a story. I think what makes something 'literary' is how it uses language creatively to explore emotions, relationships, and big questions about life. For example, Maya Angelou's 'I Know Why the Caged Bird Sings' is literary because it doesn't just tell a story - it uses beautiful, metaphorical language to help us feel what freedom and oppression really mean.",
              author: discussionPersonalities[6].name,
              created_at: "2025-05-20T14:30:00Z",
              personality: discussionPersonalities[6].personality
            },
            {
              id: 2,
              message: "Great point, Taylor! I'm Alex, and I approach this more analytically. I think literature is characterized by intentional craftsmanship in language use - the author makes deliberate choices about structure, symbolism, and style that create multiple layers of meaning. Take Shakespeare's sonnets: they're not just about love, but about time, mortality, and the power of art itself. The formal constraints actually enhance the meaning rather than limiting it.",
              author: discussionPersonalities[0].name,
              created_at: "2025-05-20T16:15:00Z",
              personality: discussionPersonalities[0].personality
            },
            {
              id: 3,
              message: "I love how you both think about this! I'm Maria, and for me, literature is anything that creates an emotional connection while making us see the world differently. It doesn't have to be 'high culture' - some song lyrics are absolutely literary! Like Bob Dylan winning the Nobel Prize shows that the boundaries are expanding. What matters is that spark of recognition when you read something and think 'yes, that's exactly how I feel' or 'I never thought about it that way before.' 🌟",
              author: discussionPersonalities[1].name,
              created_at: "2025-05-20T18:45:00Z",
              personality: discussionPersonalities[1].personality
            }
          ]
        },
        {
          id: 104,
          title: "Modern Poetry Discussion",
          message: "For this discussion, compare traditional and contemporary poetry. Choose one poem from our anthology and one contemporary poem (published 2000 or later) that handle similar themes. How do their approaches differ? What does this tell us about how poetry has evolved? Consider elements like form, language, imagery, and cultural references.",
          course_id: courseId,
          author: "Dr. Margaret Thompson",
          created_at: "2025-06-18T10:00:00Z",
          topic: "poetry-evolution",
          replies: [
            {
              id: 4,
              message: "I'm comparing Emily Dickinson's 'I'm Nobody! Who are you?' with Rupi Kaur's 'you are your own soulmate.' Both explore identity and self-worth, but so differently! Dickinson uses playful irony and questions - being 'nobody' is actually better than being 'somebody' who seeks attention. Kaur is direct and affirmative - she tells us straight up that we're complete as we are. Dickinson's poem has that classic meter and rhyme, while Kaur's free verse feels like a conversation. Both empower the reader, but Dickinson does it through wit and Kaur through compassion. Modern poetry seems more accessible but maybe less mysterious? 💭",
              author: discussionPersonalities[6].name,
              created_at: "2025-06-18T15:20:00Z",
              personality: discussionPersonalities[6].personality
            },
            {
              id: 5,
              message: "Interesting comparison, Taylor. I analyzed Robert Frost's 'The Road Not Taken' alongside Ocean Vuong's 'Someday I'll Love Ocean Vuong.' Both deal with choice and self-acceptance, but Frost uses metaphor (the diverging paths) while Vuong is autobiographical and direct. Frost's formal structure mirrors the poem's theme of conventional vs. unconventional choices. Vuong breaks traditional forms entirely - his line breaks and white space create emotional pauses. Contemporary poetry seems less concerned with universal themes and more focused on specific, personal identity experiences.",
              author: discussionPersonalities[0].name,
              created_at: "2025-06-18T17:40:00Z",
              personality: discussionPersonalities[0].personality
            }
          ]
        },
        {
          id: 108,
          title: "Dramatic Techniques Discussion",
          message: "How do playwrights use stage directions, dialogue, and dramatic irony differently than fiction writers? Think about the unique constraints and opportunities of theatrical performance. Use specific examples from our readings to support your analysis.",
          course_id: courseId,
          author: "Dr. Margaret Thompson",
          created_at: "2025-07-28T09:00:00Z",
          topic: "dramatic-techniques",
          replies: [
            {
              id: 6,
              message: "The biggest difference I notice is how playwrights have to trust actors and directors to bring their vision to life! In Shakespeare's 'Romeo and Juliet,' the balcony scene works because of what's NOT said as much as what is. The stage directions are minimal - just 'Enter Romeo' - but the dialogue carries all the emotion. Fiction writers can describe inner thoughts, but playwrights have to make characters reveal themselves through action and speech. Like when Juliet says 'Romeo, Romeo, wherefore art thou Romeo?' - we understand her conflict between love and family loyalty just from her words, not from a narrator explaining her feelings. Theatre is so immediate and vulnerable! ✨",
              author: discussionPersonalities[6].name,
              created_at: "2025-07-28T14:15:00Z",
              personality: discussionPersonalities[6].personality
            },
            {
              id: 7,
              message: "Exactly, Taylor. The constraints of theater actually create unique dramatic effects. In 'A Raisin in the Sun,' Hansberry uses the cramped apartment setting as a character itself - the physical space reflects the family's economic limitations and deferred dreams. Fiction could describe poverty in pages of exposition, but theater shows it through every moment the characters interact with their environment. The dramatic irony when Ruth is pregnant but hasn't told Walter yet creates tension that wouldn't work the same way in a novel where we might have access to multiple perspectives simultaneously.",
              author: discussionPersonalities[0].name,
              created_at: "2025-07-28T16:30:00Z",
              personality: discussionPersonalities[0].personality
            }
          ]
        },
        {
          id: 110,
          title: "Diverse Voices Discussion",
          message: "Reflect on how authors from different backgrounds (race, gender, class, nationality) bring unique perspectives to universal themes. Choose two authors we've studied and compare how their identities influence their treatment of themes like love, identity, family, or social justice.",
          course_id: courseId,
          author: "Dr. Margaret Thompson",
          created_at: "2025-08-10T10:00:00Z",
          topic: "diverse-perspectives",
          replies: [
            {
              id: 8,
              message: "I'm comparing Langston Hughes and Emily Dickinson on the theme of identity. Both write about feeling different or marginalized, but from completely different perspectives. Hughes's 'I, Too, Sing America' is bold and assertive - he claims his place in American identity despite racism, using collective 'we' and 'I' to speak for his community. Dickinson's 'I'm Nobody! Who are you?' is more private and introspective - she questions the whole idea of public identity. Hughes writes from the experience of being excluded but fighting for inclusion, while Dickinson writes from the privilege of being able to choose solitude. Their different social positions completely shape how they approach the same basic human need to belong somewhere. 💫",
              author: discussionPersonalities[6].name,
              created_at: "2025-08-10T15:45:00Z",
              personality: discussionPersonalities[6].personality
            }
          ]
        }
      ];
    }
    
    if (courseId === 6) { // Composition and Rhetoric
      return [
        {
          id: 202,
          title: "Thesis Statement Workshop",
          message: "Post three potential thesis statements for different essay types (argumentative, analytical, expository) and provide feedback on classmates' thesis statements. For each thesis, identify the topic, claim, and supporting points. Consider what makes a thesis statement effective and specific.",
          course_id: courseId,
          author: "Prof. David Martinez",
          created_at: "2025-05-20T09:00:00Z",
          topic: "thesis-development",
          replies: [
            {
              id: 10,
              message: "Here are my three thesis statements:\n\n1. Argumentative: 'Universities should implement mandatory financial literacy courses because students graduate with significant debt but lack basic money management skills, leading to long-term financial struggles that could be prevented through education.'\n\n2. Analytical: 'In 'The Great Gatsby,' Fitzgerald uses the green light as a symbol that evolves from representing Gatsby's hope and dreams to ultimately revealing the impossible nature of recapturing the past.'\n\n3. Expository: 'Effective time management for college students involves three key strategies: prioritizing tasks using the Eisenhower Matrix, breaking large projects into smaller steps, and creating consistent daily routines.'\n\nI tried to make each one specific and focused while clearly stating the main claim and supporting points. Looking forward to your feedback! 📝",
              author: discussionPersonalities[6].name,
              created_at: "2025-05-20T14:30:00Z",
              personality: discussionPersonalities[6].personality
            }
          ]
        },
        {
          id: 208,
          title: "Peer Review Workshop",
          message: "Review two classmates' position paper drafts using our peer review criteria. Provide constructive feedback on argument structure, evidence use, and counterargument handling. Focus on helping your peers strengthen their arguments rather than just pointing out problems.",
          course_id: courseId,
          author: "Prof. David Martinez",
          created_at: "2025-06-18T10:00:00Z",
          topic: "peer-review",
          replies: [
            {
              id: 11,
              message: "I reviewed Sarah's paper on social media regulation and Mike's on climate change policy. Both had strong opening arguments, but I suggested they could strengthen their counterargument sections. Sarah did a great job with ethos by citing expert sources, but could use more pathos to connect with readers emotionally. Mike's logical structure was excellent - very clear progression from problem to solution. I recommended both authors consider their opposing audience more when addressing counterarguments. It's so helpful to see how other people organize their thoughts! 🤝",
              author: discussionPersonalities[6].name,
              created_at: "2025-06-18T15:20:00Z",
              personality: discussionPersonalities[6].personality
            }
          ]
        },
        {
          id: 211,
          title: "Final Reflection Discussion",
          message: "Share one key insight about writing you've gained this semester and one goal for your continued development as a writer. Respond thoughtfully to classmates' reflections and celebrate the growth you've all achieved together.",
          course_id: courseId,
          author: "Prof. David Martinez",
          created_at: "2025-07-28T09:00:00Z",
          topic: "writing-reflection",
          replies: [
            {
              id: 12,
              message: "My biggest insight this semester is that good writing is actually good thinking made visible. Before this class, I thought writing was just about getting ideas down on paper, but now I understand that the writing process actually helps me develop and clarify my ideas. When I'm struggling with a paragraph, it usually means I'm struggling with the concept itself, not just the words.\n\nMy goal moving forward is to embrace revision as a creative process rather than just fixing mistakes. I want to see each draft as an opportunity to discover something new about my topic, not just polish what I already know. Thanks for an amazing semester, everyone! This class changed how I think about thinking. ✨",
              author: discussionPersonalities[6].name,
              created_at: "2025-07-28T14:15:00Z",
              personality: discussionPersonalities[6].personality
            }
          ]
        }
      ];
    }
    
    // Default discussions for other courses (like CS courses)
    const discussions = [
      {
        id: 1,
        title: "Introduction: Share Your Programming Goals",
        message: "Welcome everyone! Let's start by sharing what we hope to achieve in this programming course. What projects or career paths are you most excited about?",
        course_id: courseId,
        author: "Professor Smith",
        created_at: "2025-07-28T16:30:00Z",
        topic: "introductions",
        replies: [
          {
            id: 1,
            message: "I'm aiming to build efficient algorithms for data analysis. My goal is to work in fintech where performance optimization is crucial. I'm particularly interested in the mathematical foundations of algorithm complexity.",
            author: discussionPersonalities[0].name,
            created_at: "2025-07-28T18:45:00Z",
            personality: discussionPersonalities[0].personality
          },
          {
            id: 2,
            message: "That's awesome Alex! I'm super excited about web development and creating user-friendly applications! 🎉 I love the creative side of programming - making beautiful interfaces that people actually enjoy using. Maybe we could collaborate on a project sometime!",
            author: discussionPersonalities[1].name,
            created_at: "2025-07-28T19:30:00Z",
            personality: discussionPersonalities[1].personality
          },
          {
            id: 3,
            message: "My approach is more systematic. I plan to focus on software engineering principles, following best practices, and building maintainable codebases. Proper documentation and testing are my priorities.",
            author: discussionPersonalities[2].name,
            created_at: "2025-07-28T20:15:00Z",
            personality: discussionPersonalities[2].personality
          }
        ]
      },
      {
        id: 2,
        title: "Debugging Strategies Discussion",
        message: "What debugging techniques have you found most effective? Share your favorite tools and methods for tracking down those tricky bugs!",
        course_id: courseId,
        author: "Professor Smith",
        created_at: "2025-07-28T21:00:00Z",
        topic: "debugging",
        replies: [
          {
            id: 4,
            message: "I always start with systematic isolation - binary search through the codebase to narrow down the issue. Print statements at strategic points, then graduate to a proper debugger. Hypothesis-driven debugging is key.",
            author: discussionPersonalities[0].name,
            created_at: "2025-07-28T22:15:00Z",
            personality: discussionPersonalities[0].personality
          },
          {
            id: 5,
            message: "I love using colorful console.log statements! 🌈 Different colors for different types of data. And rubber duck debugging is amazing - explaining the problem out loud often reveals the solution! Sometimes I talk to my plants instead of a duck 😄",
            author: discussionPersonalities[1].name,
            created_at: "2025-07-28T23:30:00Z",
            personality: discussionPersonalities[1].personality
          },
          {
            id: 6,
            message: "Step-by-step debugging with proper IDE tools. I maintain a debugging checklist: 1) Reproduce consistently 2) Check recent changes 3) Verify assumptions 4) Use breakpoints methodically 5) Document the solution for future reference.",
            author: discussionPersonalities[2].name,
            created_at: "2025-07-29T00:45:00Z",
            personality: discussionPersonalities[2].personality
          },
          {
            id: 7,
            message: "I find pair debugging really helpful! Two sets of eyes can spot issues faster, and explaining your thought process to someone else often clarifies the problem. Plus it's less frustrating when you're not stuck alone.",
            author: discussionPersonalities[3].name,
            created_at: "2025-07-29T01:10:00Z",
            personality: discussionPersonalities[3].personality
          }
        ]
      },
      {
        id: 3,
        title: "Best Practices for Code Organization",
        message: "How do you structure your code projects? What organizational patterns have you found most maintainable?",
        course_id: courseId,
        author: "Professor Smith",
        created_at: "2025-07-29T01:55:00Z",
        topic: "code-organization",
        replies: [
          {
            id: 8,
            message: "Clean architecture principles: separate business logic from infrastructure. Use dependency inversion, single responsibility principle. Modular design allows for easier testing and maintenance.",
            author: discussionPersonalities[0].name,
            created_at: "2025-07-29T03:10:00Z",
            personality: discussionPersonalities[0].personality
          },
          {
            id: 9,
            message: "What if we created visual diagrams of our code structure? 📊 I like to sketch out how different modules connect - it helps me see the big picture! Sometimes I use fun folder names that make me smile when I'm coding late at night ✨",
            author: discussionPersonalities[1].name,
            created_at: "2025-07-29T04:25:00Z",
            personality: discussionPersonalities[1].personality
          },
          {
            id: 10,
            message: "Consistent folder structure is essential. I follow established conventions: src/, tests/, docs/, config/. Every project should have the same layout. Clear naming conventions and comprehensive README files are non-negotiable.",
            author: discussionPersonalities[2].name,
            created_at: "2025-07-29T05:05:00Z",
            personality: discussionPersonalities[2].personality
          }
        ]
      },
      {
        id: 4,
        title: "Learning Resources and Study Groups",
        message: "What learning resources have been most helpful for you? Are you interested in forming study groups for this course?",
        course_id: courseId,
        author: "Professor Smith",
        created_at: "2025-07-29T05:50:00Z",
        topic: "study-groups",
        replies: [
          {
            id: 11,
            message: "I'm definitely interested in study groups! Learning together makes everything more enjoyable 🤝 I love explaining concepts to others - it helps me understand them better too. Should we set up a Discord server or something?",
            author: discussionPersonalities[1].name,
            created_at: "2025-07-29T07:05:00Z",
            personality: discussionPersonalities[1].personality
          },
          {
            id: 12,
            message: "A study group sounds beneficial. I suggest we establish regular meeting times, set clear agendas, and rotate leadership responsibilities. We could focus on problem-solving sessions and code reviews.",
            author: discussionPersonalities[2].name,
            created_at: "2025-07-29T07:50:00Z",
            personality: discussionPersonalities[2].personality
          },
          {
            id: 13,
            message: "I'm happy to help organize! We could create different groups based on schedules and learning styles. Some people prefer morning sessions, others evening. Maybe we could have both collaborative coding sessions and peer mentoring?",
            author: discussionPersonalities[3].name,
            created_at: "2025-07-29T08:35:00Z",
            personality: discussionPersonalities[3].personality
          }
        ]
      }
    ];
    
    return discussions;
  },

  getDiscussion: async (discussionId: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Search across all courses for the discussion
    for (const courseId of [5, 6, 1, 2, 3, 4]) { // Check English courses first, then others
      try {
        const courseDiscussions = await mockCanvasApi.getDiscussions(courseId);
        const discussion = courseDiscussions.find(d => d.id === discussionId);
        if (discussion) {
          return discussion;
        }
      } catch (error) {
        // Continue to next course if this one has no discussions
        continue;
      }
    }
    
    return null;
  },

  // Course management functions
  deleteCourse: async (courseId: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = courses.findIndex(course => course.id === courseId);
    if (index === -1) {
      throw new Error('Course not found');
    }
    
    courses.splice(index, 1);
    return { success: true };
  },

  addCourse: async (course: Course) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a new ID
    const newId = Math.max(...courses.map(c => c.id)) + 1;
    const newCourse = { ...course, id: newId };
    
    courses.push(newCourse);
    return { success: true, course: newCourse };
  }
}; 