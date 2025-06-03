import { Course, Module, ModuleItem } from './mockCanvasApi';
import { addDays, addWeeks, format } from 'date-fns';

interface CourseGenerationOptions {
  name: string;
  courseCode: string;
  description: string;
  instructor: string;
  term: string;
  startDate: Date;
  endDate: Date;
  totalPoints: number;
}

function generateModuleContent(moduleNumber: number, topic: string): string {
  const topics = [
    'Introduction to key concepts',
    'Advanced techniques and methodologies',
    'Practical applications and case studies',
    'Critical analysis and evaluation',
    'Research methods and data analysis',
    'Implementation strategies',
    'Future trends and developments'
  ];
  
  return `This module focuses on ${topic}. ${topics[moduleNumber - 1]}. Students will engage with theoretical frameworks and practical applications.`;
}

function generateAssignmentContent(moduleNumber: number, topic: string): string {
  const types = [
    'Research Paper',
    'Case Study Analysis',
    'Project Implementation',
    'Critical Review',
    'Data Analysis Report',
    'Strategic Plan',
    'Final Project'
  ];
  
  return `Complete a ${types[moduleNumber - 1]} related to ${topic}. Include theoretical frameworks, practical applications, and critical analysis.`;
}

function generateQuizContent(moduleNumber: number, topic: string): string {
  return `Test your understanding of ${topic} concepts, including key theories, methodologies, and practical applications.`;
}

function generateDiscussionContent(moduleNumber: number, topic: string): string {
  return `Engage in a discussion about ${topic}. Share your insights, experiences, and perspectives on the key concepts covered in this module.`;
}

export function generateCourse(options: CourseGenerationOptions): Course {
  const { name, courseCode, description, instructor, term, startDate, endDate, totalPoints } = options;
  
  // Calculate module dates
  const moduleDates = [
    addWeeks(startDate, 2),  // Module 1
    addWeeks(startDate, 4),  // Module 2
    addWeeks(startDate, 6),  // Module 3
    addWeeks(startDate, 8),  // Module 4
    addWeeks(startDate, 10), // Module 5
    addWeeks(startDate, 12), // Module 6
    addWeeks(startDate, 14), // Module 7
  ];

  // Generate modules with realistic content
  const modules: Module[] = moduleDates.map((date, index) => {
    const moduleNumber = index + 1;
    const topic = `${name} - Module ${moduleNumber}`;
    
    return {
      id: moduleNumber,
      name: `Module ${moduleNumber}: ${topic}`,
      description: generateModuleContent(moduleNumber, topic),
      is_completed: false,
      items: [
        {
          id: moduleNumber * 100 + 1,
          title: `Welcome to Module ${moduleNumber}`,
          type: 'page',
          content: generateModuleContent(moduleNumber, topic),
          due_date: format(date, 'yyyy-MM-dd'),
          status: 'not_started',
          points_possible: 0
        },
        {
          id: moduleNumber * 100 + 2,
          title: `Module ${moduleNumber} Assignment`,
          type: 'assignment',
          content: generateAssignmentContent(moduleNumber, topic),
          due_date: format(addDays(date, 7), 'yyyy-MM-dd'),
          status: 'not_started',
          points_possible: Math.floor(totalPoints / 7 * 0.4),
          submissions: 0,
          attempts: 0,
          max_attempts: 3
        },
        {
          id: moduleNumber * 100 + 3,
          title: `Module ${moduleNumber} Quiz`,
          type: 'quiz',
          content: generateQuizContent(moduleNumber, topic),
          due_date: format(addDays(date, 10), 'yyyy-MM-dd'),
          status: 'not_started',
          points_possible: Math.floor(totalPoints / 7 * 0.3),
          submissions: 0,
          attempts: 0,
          max_attempts: 2
        },
        {
          id: moduleNumber * 100 + 4,
          title: `Module ${moduleNumber} Discussion`,
          type: 'discussion',
          content: generateDiscussionContent(moduleNumber, topic),
          due_date: format(addDays(date, 12), 'yyyy-MM-dd'),
          status: 'not_started',
          points_possible: Math.floor(totalPoints / 7 * 0.3),
          submissions: 0,
          attempts: 0
        }
      ]
    };
  });

  return {
    id: Math.floor(Math.random() * 1000) + 1,
    name,
    course_code: courseCode,
    description,
    instructor,
    term,
    total_points: totalPoints,
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
    modules,
    current_grade: undefined
  };
}

export function generateCourseFromPrompt(prompt: string): Course {
  // Parse the prompt to extract course information
  const lines = prompt.split('\n');
  const courseInfo: Partial<CourseGenerationOptions> = {};
  
  lines.forEach(line => {
    const [key, value] = line.split(':').map(s => s.trim());
    if (key && value) {
      switch (key.toLowerCase()) {
        case 'name':
          courseInfo.name = value;
          break;
        case 'code':
          courseInfo.courseCode = value;
          break;
        case 'description':
          courseInfo.description = value;
          break;
        case 'instructor':
          courseInfo.instructor = value;
          break;
        case 'term':
          courseInfo.term = value;
          break;
      }
    }
  });

  // Set default values for missing fields
  const startDate = new Date('2025-05-30');
  const endDate = addWeeks(startDate, 16);

  return generateCourse({
    name: courseInfo.name || 'New Course',
    courseCode: courseInfo.courseCode || 'NEW101',
    description: courseInfo.description || 'Course description',
    instructor: courseInfo.instructor || 'Instructor Name',
    term: courseInfo.term || 'Summer 2025',
    startDate,
    endDate,
    totalPoints: 1000
  });
} 