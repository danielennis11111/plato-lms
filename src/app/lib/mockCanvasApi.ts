// Mock data for development
const mockUser = {
  id: 1,
  name: 'John Smith',
  email: 'student@example.com',
  avatar_url: 'https://ui-avatars.com/api/?name=John+Smith',
  enrollment_type: 'student',
  roles: ['student'],
  time_zone: 'America/Phoenix',
  locale: 'en',
  bio: 'Computer Science major at Arizona State University',
  created_at: '2025-05-28T00:00:00Z',
  updated_at: '2025-05-28T00:00:00Z'
};

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    name: 'Introduction to Game Development',
    course_code: 'CSE 205',
    description: 'Learn the fundamentals of game development using Python and Pygame.',
    start_at: '2025-05-28',
    end_at: '2025-07-15',
    enrollment_state: 'active',
    modules: [
      {
        id: 1,
        name: 'Python Fundamentals',
        description: 'Basic Python programming concepts and syntax',
        items: [
          {
            id: 101,
            type: 'assignment',
            title: 'Python Basics Quiz',
            url: '/courses/1/assignments/101'
          },
          {
            id: 102,
            type: 'assignment',
            title: 'Variables and Data Types',
            url: '/courses/1/assignments/102'
          }
        ]
      },
      {
        id: 2,
        name: 'Pygame Introduction',
        description: 'Getting started with Pygame and game development',
        items: [
          {
            id: 201,
            type: 'assignment',
            title: 'First Pygame Project',
            url: '/courses/1/assignments/201'
          }
        ]
      }
    ],
    learning_objectives: [
      {
        id: 1,
        title: 'Python Programming Fundamentals',
        description: 'Master basic Python syntax and programming concepts',
        checkpoints: [
          { id: 1, title: 'Complete Python Basics Quiz', completed: false },
          { id: 2, title: 'Practice with Variables and Data Types', completed: false },
          { id: 3, title: 'Implement Basic Functions', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Game Development Basics',
        description: 'Understand core game development concepts using Pygame',
        checkpoints: [
          { id: 4, title: 'Create First Game Window', completed: false },
          { id: 5, title: 'Implement Basic Game Loop', completed: false },
          { id: 6, title: 'Add Player Movement', completed: false }
        ]
      }
    ],
    quiz_questions: {
      python_basics: [
        {
          id: 1,
          question: 'What is the correct way to create a variable in Python?',
          options: [
            'var x = 5',
            'x = 5',
            'let x = 5',
            'const x = 5'
          ],
          correct_answer: 1,
          explanation: 'In Python, variables are created using the assignment operator (=) without any type declaration.'
        },
        {
          id: 2,
          question: 'Which of the following is a valid Python list?',
          options: [
            '[1, 2, 3]',
            '(1, 2, 3)',
            '{1, 2, 3}',
            '<1, 2, 3>'
          ],
          correct_answer: 0,
          explanation: 'Lists in Python are created using square brackets [].'
        }
      ],
      pygame_basics: [
        {
          id: 3,
          question: 'What is the first step to initialize Pygame?',
          options: [
            'pygame.create()',
            'pygame.init()',
            'pygame.start()',
            'pygame.setup()'
          ],
          correct_answer: 1,
          explanation: 'pygame.init() initializes all Pygame modules and must be called before using any Pygame functionality.'
        }
      ]
    }
  },
  {
    id: 2,
    name: 'Calculus I',
    course_code: 'MAT 265',
    description: 'Introduction to differential calculus and its applications.',
    start_at: '2025-05-28',
    end_at: '2025-07-15',
    enrollment_state: 'active',
    modules: [
      {
        id: 1,
        name: 'Limits and Continuity',
        description: 'Understanding limits and continuous functions',
        items: [
          {
            id: 101,
            type: 'assignment',
            title: 'Limits Quiz',
            url: '/courses/2/assignments/101'
          }
        ]
      },
      {
        id: 2,
        name: 'Derivatives',
        description: 'Introduction to derivatives and differentiation',
        items: [
          {
            id: 201,
            type: 'assignment',
            title: 'Derivatives Practice',
            url: '/courses/2/assignments/201'
          }
        ]
      }
    ],
    learning_objectives: [
      {
        id: 1,
        title: 'Limits and Continuity',
        description: 'Master the concepts of limits and continuous functions',
        checkpoints: [
          { id: 1, title: 'Understand Basic Limits', completed: false },
          { id: 2, title: 'Solve Limit Problems', completed: false },
          { id: 3, title: 'Apply Continuity Concepts', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Derivatives',
        description: 'Learn differentiation techniques and applications',
        checkpoints: [
          { id: 4, title: 'Master Basic Differentiation', completed: false },
          { id: 5, title: 'Apply Chain Rule', completed: false },
          { id: 6, title: 'Solve Optimization Problems', completed: false }
        ]
      }
    ],
    quiz_questions: {
      limits: [
        {
          id: 1,
          question: 'What is the limit of sin(x)/x as x approaches 0?',
          options: ['0', '1', 'undefined', '∞'],
          correct_answer: 1,
          explanation: 'This is a fundamental limit in calculus, often used in trigonometric derivatives.'
        }
      ],
      derivatives: [
        {
          id: 2,
          question: 'What is the derivative of f(x) = x²?',
          options: ['2x', 'x²', '2', 'x'],
          correct_answer: 0,
          explanation: 'The derivative of x² is 2x using the power rule: d/dx(x^n) = n*x^(n-1)'
        }
      ]
    }
  },
  {
    id: 3,
    name: 'General Chemistry for Engineers',
    course_code: 'CHM 113',
    start_at: '2025-05-28T00:00:00Z',
    end_at: '2025-07-15T00:00:00Z',
    enrollment_state: 'active',
    description: 'Fundamental principles of chemistry with emphasis on engineering applications. Topics include atomic structure, chemical bonding, thermodynamics, and kinetics.',
  },
  {
    id: 4,
    name: 'Engineering Design and Communication',
    course_code: 'FSE 100',
    start_at: '2025-05-28T00:00:00Z',
    end_at: '2025-07-15T00:00:00Z',
    enrollment_state: 'active',
    description: 'Introduction to engineering design process, technical communication, and teamwork. Students work on real-world projects and develop professional skills.',
  }
];

const mockModules = [
  {
    id: 1,
    course_id: 1,
    name: 'Introduction to Programming',
    description: 'Basic programming concepts and Python fundamentals',
    items: [
      { id: 1, type: 'assignment', title: 'Python Basics Quiz', url: '#' },
      { id: 2, type: 'discussion', title: 'Programming Discussion', url: '#' },
    ]
  },
  {
    id: 2,
    course_id: 1,
    name: 'Data Structures',
    description: 'Understanding and implementing basic data structures',
    items: [
      { id: 3, type: 'assignment', title: 'Data Structures Lab', url: '#' },
      { id: 4, type: 'quiz', title: 'Data Structures Quiz', url: '#' },
    ]
  },
  // Add more modules for other courses...
];

const mockAssignments = [
  // CSE 205 Assignments
  {
    id: 1,
    name: 'Python Basics Quiz',
    description: 'Test your understanding of basic Python concepts including variables, data types, and basic operations.',
    due_at: '2025-06-05T23:59:59Z',
    course_id: 1,
    points_possible: 100,
    submission_type: 'online_quiz',
    status: 'todo',
    quiz_details: {
      time_limit: 60,
      allowed_attempts: 2,
      questions: [
        {
          id: 1,
          question: 'What is the output of print(type(5))?',
          type: 'multiple_choice',
          options: ['<class int>', '<class float>', '<class number>', '<class integer>'],
          correct_answer: 0,
          points: 20
        },
        {
          id: 2,
          question: 'Which of the following is a valid Python variable name?',
          type: 'multiple_choice',
          options: ['123var', '_myVar', 'my-var', 'my var'],
          correct_answer: 1,
          points: 20
        },
        {
          id: 3,
          question: 'What does the len() function do?',
          type: 'multiple_choice',
          options: [
            'Returns the length of a sequence',
            'Returns the largest number in a sequence',
            'Returns the smallest number in a sequence',
            'Returns the sum of a sequence'
          ],
          correct_answer: 0,
          points: 20
        },
        {
          id: 4,
          question: 'Which operator is used for exponentiation in Python?',
          type: 'multiple_choice',
          options: ['^', '**', '^^', 'pow'],
          correct_answer: 1,
          points: 20
        },
        {
          id: 5,
          question: 'What is the result of 3 / 2 in Python 3?',
          type: 'multiple_choice',
          options: ['1', '1.5', '2', 'Error'],
          correct_answer: 1,
          points: 20
        }
      ]
    }
  },
  {
    id: 2,
    name: 'Control Structures Project',
    description: 'Create a program that demonstrates the use of loops and conditional statements to solve a real-world problem.',
    due_at: '2025-06-15T23:59:59Z',
    course_id: 1,
    points_possible: 150,
    submission_type: 'online_text_entry',
    status: 'in_progress',
    requirements: [
      'Program must use at least one for loop and one while loop',
      'Include at least three different conditional statements',
      'Handle user input with proper validation',
      'Include comments explaining the code logic',
      'Submit a working Python file (.py)'
    ],
    rubric: [
      {
        criterion: 'Code Structure',
        points: 30,
        description: 'Code is well-organized, properly indented, and follows Python style guidelines'
      },
      {
        criterion: 'Functionality',
        points: 50,
        description: 'Program works as intended and handles edge cases appropriately'
      },
      {
        criterion: 'Documentation',
        points: 20,
        description: 'Code includes clear comments and a README file explaining how to run the program'
      },
      {
        criterion: 'Error Handling',
        points: 30,
        description: 'Program includes proper input validation and error handling'
      },
      {
        criterion: 'Creativity',
        points: 20,
        description: 'Solution demonstrates creative problem-solving and efficient use of control structures'
      }
    ]
  },
  {
    id: 3,
    name: 'Data Structures Quiz',
    description: 'Test your understanding of Python data structures including lists, tuples, dictionaries, and sets.',
    due_at: '2025-06-20T23:59:59Z',
    course_id: 1,
    points_possible: 100,
    submission_type: 'online_quiz',
    status: 'todo',
    quiz_details: {
      time_limit: 45,
      allowed_attempts: 1,
      questions: [
        {
          id: 1,
          question: 'Which data structure is mutable and ordered?',
          type: 'multiple_choice',
          options: ['Tuple', 'List', 'Set', 'Dictionary'],
          correct_answer: 1,
          points: 20
        },
        {
          id: 2,
          question: 'What is the time complexity of accessing an element in a dictionary?',
          type: 'multiple_choice',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          correct_answer: 0,
          points: 20
        },
        {
          id: 3,
          question: 'Which method is used to add an element to a set?',
          type: 'multiple_choice',
          options: ['append()', 'add()', 'insert()', 'push()'],
          correct_answer: 1,
          points: 20
        },
        {
          id: 4,
          question: 'What is the output of len([1, 2, 3, 4, 5][1:3])?',
          type: 'multiple_choice',
          options: ['2', '3', '4', '5'],
          correct_answer: 0,
          points: 20
        },
        {
          id: 5,
          question: 'Which data structure is immutable?',
          type: 'multiple_choice',
          options: ['List', 'Dictionary', 'Set', 'Tuple'],
          correct_answer: 3,
          points: 20
        }
      ]
    }
  },
  {
    id: 4,
    name: 'Object-Oriented Programming Project',
    description: 'Create a class hierarchy to model a real-world system using object-oriented programming principles.',
    due_at: '2025-06-25T23:59:59Z',
    course_id: 1,
    points_possible: 200,
    submission_type: 'online_text_entry',
    status: 'todo',
    requirements: [
      'Implement at least three related classes with inheritance',
      'Use proper encapsulation with private attributes and methods',
      'Include at least one abstract class or interface',
      'Implement method overriding and polymorphism',
      'Include unit tests for your classes'
    ],
    rubric: [
      {
        criterion: 'Class Design',
        points: 50,
        description: 'Classes are well-designed with proper inheritance and encapsulation'
      },
      {
        criterion: 'Implementation',
        points: 60,
        description: 'Code correctly implements OOP principles and works as intended'
      },
      {
        criterion: 'Documentation',
        points: 30,
        description: 'Code includes clear documentation and class diagrams'
      },
      {
        criterion: 'Testing',
        points: 40,
        description: 'Comprehensive unit tests with good coverage'
      },
      {
        criterion: 'Code Quality',
        points: 20,
        description: 'Code follows best practices and is well-organized'
      }
    ]
  },

  // MAT 265 Assignments
  {
    id: 5,
    name: 'Limits and Continuity Quiz',
    description: 'Multiple choice and short answer questions on limits, continuity, and their applications.',
    due_at: '2025-06-03T23:59:59Z',
    points_possible: 50,
    course_id: 2,
    submission_type: 'online_quiz',
  },
  {
    id: 6,
    name: 'Derivatives Problem Set',
    description: 'Solve problems involving derivatives, including chain rule, implicit differentiation, and related rates.',
    due_at: '2025-06-12T23:59:59Z',
    points_possible: 100,
    course_id: 2,
    submission_type: 'online_text_entry',
  },
  {
    id: 7,
    name: 'Applications of Derivatives',
    description: 'Problems on optimization, curve sketching, and related rates. Show all work and justify your solutions.',
    due_at: '2025-06-22T23:59:59Z',
    points_possible: 150,
    course_id: 2,
    submission_type: 'online_text_entry',
  },
  {
    id: 8,
    name: 'Integration Techniques',
    description: 'Practice problems on various integration techniques including substitution, parts, and partial fractions.',
    due_at: '2025-07-05T23:59:59Z',
    points_possible: 150,
    course_id: 2,
    submission_type: 'online_text_entry',
  },

  // CHM 113 Assignments
  {
    id: 9,
    name: 'Atomic Structure Lab Report',
    description: 'Write a detailed lab report on atomic structure experiments, including data analysis and conclusions.',
    due_at: '2025-06-08T23:59:59Z',
    points_possible: 100,
    course_id: 3,
    submission_type: 'online_text_entry',
  },
  {
    id: 10,
    name: 'Chemical Bonding Quiz',
    description: 'Quiz covering ionic and covalent bonding, molecular geometry, and intermolecular forces.',
    due_at: '2025-06-18T23:59:59Z',
    points_possible: 50,
    course_id: 3,
    submission_type: 'online_quiz',
  },
  {
    id: 11,
    name: 'Thermodynamics Problem Set',
    description: 'Solve problems involving heat, work, enthalpy, and entropy calculations.',
    due_at: '2025-06-28T23:59:59Z',
    points_possible: 150,
    course_id: 3,
    submission_type: 'online_text_entry',
  },
  {
    id: 12,
    name: 'Final Lab Project',
    description: 'Design and conduct an experiment to determine reaction rates and mechanisms.',
    due_at: '2025-07-12T23:59:59Z',
    points_possible: 200,
    course_id: 3,
    submission_type: 'online_text_entry',
  },

  // FSE 100 Assignments
  {
    id: 13,
    name: 'Team Formation and Project Proposal',
    description: 'Form teams and submit a project proposal addressing a real-world engineering challenge.',
    due_at: '2025-06-02T23:59:59Z',
    points_possible: 100,
    course_id: 4,
    submission_type: 'online_text_entry',
  },
  {
    id: 14,
    name: 'Technical Documentation',
    description: 'Create technical documentation for your project, including specifications, diagrams, and implementation details.',
    due_at: '2025-06-15T23:59:59Z',
    points_possible: 150,
    course_id: 4,
    submission_type: 'online_text_entry',
  },
  {
    id: 15,
    name: 'Midterm Presentation',
    description: 'Present your project progress to the class, including challenges faced and solutions implemented.',
    due_at: '2025-06-30T23:59:59Z',
    points_possible: 100,
    course_id: 4,
    submission_type: 'online_text_entry',
  },
  {
    id: 16,
    name: 'Final Project Report and Presentation',
    description: 'Submit final project report and deliver a presentation showcasing your completed work.',
    due_at: '2025-07-12T23:59:59Z',
    points_possible: 200,
    course_id: 4,
    submission_type: 'online_text_entry',
  }
];

// Mock Canvas API implementation
export const mockCanvasApi = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (email === 'student@example.com' && password === 'password') {
        return { token: 'mock_token', user: mockUser };
      }
      throw new Error('Invalid credentials');
    },
    check: async (token: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (token === 'mock_token') {
        return mockUser;
      }
      return null;
    },
    getToken: async (code: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (code === 'mock_code') {
        return { token: 'mock_token', user: mockUser };
      }
      throw new Error('Invalid authorization code');
    },
    validateToken: async (token: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (token === 'mock_token') {
        return mockUser;
      }
      return null;
    }
  },

  // User endpoints
  users: {
    getCurrentUser: async () => {
      return mockUser;
    },
  },

  // Course endpoints
  courses: {
    list: async () => [
      {
        id: 1,
        name: "Introduction to Computer Science",
        course_code: "CS101",
        term: "Fall 2024",
        start_at: "2024-09-01",
        end_at: "2024-12-15",
        description: "An introductory course covering fundamental programming concepts and problem-solving techniques.",
        subject: "Computer Science"
      },
      {
        id: 2,
        name: "Data Structures and Algorithms",
        course_code: "CS201",
        term: "Fall 2024",
        start_at: "2024-09-01",
        end_at: "2024-12-15",
        description: "Study of fundamental data structures and algorithms, including analysis of time and space complexity.",
        subject: "Computer Science"
      },
      {
        id: 3,
        name: "Web Development Fundamentals",
        course_code: "CS301",
        term: "Fall 2024",
        start_at: "2024-09-01",
        end_at: "2024-12-15",
        description: "Learn modern web development technologies including HTML, CSS, JavaScript, and React.",
        subject: "Computer Science"
      },
      {
        id: 4,
        name: "Database Systems",
        course_code: "CS401",
        term: "Fall 2024",
        start_at: "2024-09-01",
        end_at: "2024-12-15",
        description: "Introduction to database design, SQL, and database management systems.",
        subject: "Computer Science"
      }
    ],
    get: async (id: number) => {
      const courses = await mockCanvasApi.courses.list();
      return courses.find(course => course.id === id);
    }
  },

  // Module endpoints
  modules: {
    list: async (courseId: number) => [
      {
        id: 1,
        name: "Module 1: Introduction to Programming",
        course_id: courseId,
        items: [
          {
            id: 1,
            title: "Getting Started with Python",
            type: "page",
            url: "/courses/1/modules/1/items/1"
          },
          {
            id: 2,
            title: "Basic Programming Concepts",
            type: "page",
            url: "/courses/1/modules/1/items/2"
          }
        ]
      },
      {
        id: 2,
        name: "Module 2: Control Structures",
        course_id: courseId,
        items: [
          {
            id: 3,
            title: "Conditionals and Loops",
            type: "page",
            url: "/courses/1/modules/2/items/3"
          },
          {
            id: 4,
            title: "Practice Exercises",
            type: "assignment",
            url: "/courses/1/modules/2/items/4"
          }
        ]
      }
    ]
  },

  // Assignment endpoints
  assignments: {
    list: async () => [
      {
        id: 1,
        name: 'Python Basics Quiz',
        description: 'Test your understanding of basic Python concepts including variables, data types, and basic operations.',
        due_at: '2025-06-05T23:59:59Z',
        course_id: 1,
        points_possible: 100,
        submission_type: 'online_quiz',
        status: 'todo',
        quiz_details: {
          time_limit: 60,
          allowed_attempts: 2,
          questions: [
            {
              id: 1,
              question: 'What is the output of print(type(5))?',
              type: 'multiple_choice',
              options: ['<class int>', '<class float>', '<class number>', '<class integer>'],
              correct_answer: 0,
              points: 20
            },
            {
              id: 2,
              question: 'Which of the following is a valid Python variable name?',
              type: 'multiple_choice',
              options: ['123var', '_myVar', 'my-var', 'my var'],
              correct_answer: 1,
              points: 20
            },
            {
              id: 3,
              question: 'What does the len() function do?',
              type: 'multiple_choice',
              options: [
                'Returns the length of a sequence',
                'Returns the largest number in a sequence',
                'Returns the smallest number in a sequence',
                'Returns the sum of a sequence'
              ],
              correct_answer: 0,
              points: 20
            },
            {
              id: 4,
              question: 'Which operator is used for exponentiation in Python?',
              type: 'multiple_choice',
              options: ['^', '**', '^^', 'pow'],
              correct_answer: 1,
              points: 20
            },
            {
              id: 5,
              question: 'What is the result of 3 / 2 in Python 3?',
              type: 'multiple_choice',
              options: ['1', '1.5', '2', 'Error'],
              correct_answer: 1,
              points: 20
            }
          ]
        }
      },
      {
        id: 2,
        name: 'Control Structures Project',
        description: 'Create a program that demonstrates the use of loops and conditional statements to solve a real-world problem.',
        due_at: '2025-06-15T23:59:59Z',
        course_id: 1,
        points_possible: 150,
        submission_type: 'online_text_entry',
        status: 'in_progress',
        requirements: [
          'Program must use at least one for loop and one while loop',
          'Include at least three different conditional statements',
          'Handle user input with proper validation',
          'Include comments explaining the code logic',
          'Submit a working Python file (.py)'
        ],
        rubric: [
          {
            criterion: 'Code Structure',
            points: 30,
            description: 'Code is well-organized, properly indented, and follows Python style guidelines'
          },
          {
            criterion: 'Functionality',
            points: 50,
            description: 'Program works as intended and handles edge cases appropriately'
          },
          {
            criterion: 'Documentation',
            points: 20,
            description: 'Code includes clear comments and a README file explaining how to run the program'
          },
          {
            criterion: 'Error Handling',
            points: 30,
            description: 'Program includes proper input validation and error handling'
          },
          {
            criterion: 'Creativity',
            points: 20,
            description: 'Solution demonstrates creative problem-solving and efficient use of control structures'
          }
        ]
      },
      {
        id: 3,
        name: 'Data Structures Quiz',
        description: 'Test your understanding of Python data structures including lists, tuples, dictionaries, and sets.',
        due_at: '2025-06-20T23:59:59Z',
        course_id: 1,
        points_possible: 100,
        submission_type: 'online_quiz',
        status: 'todo',
        quiz_details: {
          time_limit: 45,
          allowed_attempts: 1,
          questions: [
            {
              id: 1,
              question: 'Which data structure is mutable and ordered?',
              type: 'multiple_choice',
              options: ['Tuple', 'List', 'Set', 'Dictionary'],
              correct_answer: 1,
              points: 20
            },
            {
              id: 2,
              question: 'What is the time complexity of accessing an element in a dictionary?',
              type: 'multiple_choice',
              options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
              correct_answer: 0,
              points: 20
            },
            {
              id: 3,
              question: 'Which method is used to add an element to a set?',
              type: 'multiple_choice',
              options: ['append()', 'add()', 'insert()', 'push()'],
              correct_answer: 1,
              points: 20
            },
            {
              id: 4,
              question: 'What is the output of len([1, 2, 3, 4, 5][1:3])?',
              type: 'multiple_choice',
              options: ['2', '3', '4', '5'],
              correct_answer: 0,
              points: 20
            },
            {
              id: 5,
              question: 'Which data structure is immutable?',
              type: 'multiple_choice',
              options: ['List', 'Dictionary', 'Set', 'Tuple'],
              correct_answer: 3,
              points: 20
            }
          ]
        }
      },
      {
        id: 4,
        name: 'Object-Oriented Programming Project',
        description: 'Create a class hierarchy to model a real-world system using object-oriented programming principles.',
        due_at: '2025-06-25T23:59:59Z',
        course_id: 1,
        points_possible: 200,
        submission_type: 'online_text_entry',
        status: 'todo',
        requirements: [
          'Implement at least three related classes with inheritance',
          'Use proper encapsulation with private attributes and methods',
          'Include at least one abstract class or interface',
          'Implement method overriding and polymorphism',
          'Include unit tests for your classes'
        ],
        rubric: [
          {
            criterion: 'Class Design',
            points: 50,
            description: 'Classes are well-designed with proper inheritance and encapsulation'
          },
          {
            criterion: 'Implementation',
            points: 60,
            description: 'Code correctly implements OOP principles and works as intended'
          },
          {
            criterion: 'Documentation',
            points: 30,
            description: 'Code includes clear documentation and class diagrams'
          },
          {
            criterion: 'Testing',
            points: 40,
            description: 'Comprehensive unit tests with good coverage'
          },
          {
            criterion: 'Code Quality',
            points: 20,
            description: 'Code follows best practices and is well-organized'
          }
        ]
      }
    ],
    get: async (id: number) => {
      const assignments = await mockCanvasApi.assignments.list();
      return assignments.find(a => a.id === id);
    },
    updateStatus: async (id: number, status: 'todo' | 'in_progress' | 'completed') => {
      console.log(`Updating assignment ${id} status to ${status}`);
      return { success: true };
    }
  },

  learning: {
    updateProgress: async (courseId: number, objectiveId: number, checkpointId: number) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const course = mockCourses.find(c => c.id === courseId);
      if (!course || !course.learning_objectives) {
        throw new Error('Course or learning objectives not found');
      }

      const objective = course.learning_objectives.find(o => o.id === objectiveId);
      if (!objective) {
        throw new Error('Learning objective not found');
      }

      const checkpoint = objective.checkpoints.find(c => c.id === checkpointId);
      if (!checkpoint) {
        throw new Error('Checkpoint not found');
      }

      checkpoint.completed = true;
      return { success: true, checkpoint };
    },
    getQuizQuestions: async (courseId: number, topic: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const course = mockCourses.find(c => c.id === courseId);
      if (!course || !course.quiz_questions) {
        throw new Error('Course or quiz questions not found');
      }

      const questions = course.quiz_questions[topic as keyof typeof course.quiz_questions];
      if (!questions) {
        throw new Error('Quiz questions not found for this topic');
      }

      return questions;
    }
  },

  discussions: {
    list: async (courseId: number) => [
      {
        id: 1,
        title: "Welcome to CS101!",
        message: "Welcome to Introduction to Computer Science! Let's introduce ourselves and discuss our programming experience.",
        course_id: courseId,
        author: "Professor Smith",
        created_at: "2024-09-01T10:00:00Z",
        replies: [
          {
            id: 1,
            message: "Hi! I'm excited to learn programming!",
            author: "Student 1",
            created_at: "2024-09-01T11:00:00Z"
          }
        ]
      },
      {
        id: 2,
        title: "Programming Assignment 1 Discussion",
        message: "Use this thread to discuss any questions about the first programming assignment.",
        course_id: courseId,
        author: "Professor Smith",
        created_at: "2024-09-05T14:00:00Z",
        replies: []
      }
    ]
  }
}; 