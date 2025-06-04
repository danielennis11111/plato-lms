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
  
  // Determine course type for specialized content
  const courseType = determineCourseType(name, description);
  
  // Calculate module dates based on course duration
  const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 7));
  const moduleCount = Math.min(Math.max(Math.floor(totalWeeks / 2), 4), 8); // 4-8 modules
  
  const moduleDates = Array.from({ length: moduleCount }, (_, i) => 
    addWeeks(startDate, Math.floor((totalWeeks / moduleCount) * (i + 1)))
  );

  // Generate specialized modules based on course type
  const modules: Module[] = moduleDates.map((date, index) => {
    const moduleNumber = index + 1;
    return generateSpecializedModule(moduleNumber, courseType, name, date, totalPoints, moduleCount);
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

function generateSpecializedModule(
  moduleNumber: number, 
  courseType: string, 
  courseName: string, 
  dueDate: Date, 
  totalPoints: number, 
  totalModules: number
): Module {
  const moduleData = getModuleDataForType(courseType, moduleNumber, courseName);
  
  return {
    id: moduleNumber,
    name: `Module ${moduleNumber}: ${moduleData.name}`,
    description: moduleData.description,
    is_completed: false,
    items: [
      {
        id: moduleNumber * 100 + 1,
        title: moduleData.pageTitle,
        type: 'page',
        content: moduleData.pageContent,
        due_date: format(dueDate, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
        status: 'not_started',
        points_possible: 0
      },
      {
        id: moduleNumber * 100 + 2,
        title: moduleData.assignmentTitle,
        type: 'assignment',
        content: moduleData.assignmentContent,
        due_date: format(addDays(dueDate, 7), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
        status: 'not_started',
        points_possible: Math.floor(totalPoints / totalModules * 0.4),
        submissions: 0,
        attempts: 0,
        max_attempts: 3
      },
      {
        id: moduleNumber * 100 + 3,
        title: moduleData.quizTitle,
        type: 'quiz',
        content: moduleData.quizContent,
        due_date: format(addDays(dueDate, 10), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
        status: 'not_started',
        points_possible: Math.floor(totalPoints / totalModules * 0.3),
        submissions: 0,
        attempts: 0,
        max_attempts: 2
      },
      {
        id: moduleNumber * 100 + 4,
        title: moduleData.discussionTitle,
        type: 'discussion',
        content: moduleData.discussionContent,
        due_date: format(addDays(dueDate, 12), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
        status: 'not_started',
        points_possible: Math.floor(totalPoints / totalModules * 0.3),
        submissions: 0,
        attempts: 0
      }
    ]
  };
}

function getModuleDataForType(courseType: string, moduleNumber: number, courseName: string): any {
  const baseModules = {
    project: [
      {
        name: 'Project Planning and Proposal',
        description: 'Develop your project proposal, define scope, and create a comprehensive project plan.',
        pageTitle: 'Project Planning Fundamentals',
        pageContent: 'Learn essential project planning methodologies, scope definition, and proposal development techniques.',
        assignmentTitle: 'Project Proposal',
        assignmentContent: 'Develop a comprehensive project proposal including problem statement, methodology, timeline, and expected outcomes.',
        quizTitle: 'Project Management Concepts Quiz',
        quizContent: 'Test your understanding of project management principles, planning techniques, and proposal components.',
        discussionTitle: 'Project Ideas and Scope Discussion',
        discussionContent: 'Share your project ideas with peers and discuss scope, feasibility, and potential challenges.'
      },
      {
        name: 'Literature Review and Research Methods',
        description: 'Conduct thorough research and develop a comprehensive literature review for your project.',
        pageTitle: 'Research Methodology',
        pageContent: 'Master research techniques, source evaluation, and systematic literature review processes.',
        assignmentTitle: 'Literature Review',
        assignmentContent: 'Conduct a comprehensive literature review related to your project topic, synthesizing key findings and identifying gaps.',
        quizTitle: 'Research Methods Quiz',
        quizContent: 'Evaluate your understanding of research methodologies, source credibility, and literature synthesis.',
        discussionTitle: 'Research Findings Discussion',
        discussionContent: 'Share key insights from your literature review and discuss how they inform your project approach.'
      },
      {
        name: 'Methodology and Design',
        description: 'Develop detailed methodology and design framework for your applied project.',
        pageTitle: 'Design Thinking and Methodology',
        pageContent: 'Explore design thinking principles, methodology selection, and framework development.',
        assignmentTitle: 'Methodology Design',
        assignmentContent: 'Create a detailed methodology section including approach, tools, techniques, and validation methods.',
        quizTitle: 'Design Methodology Quiz',
        quizContent: 'Test your knowledge of design methodologies, validation techniques, and implementation strategies.',
        discussionTitle: 'Methodology Peer Review',
        discussionContent: 'Present your methodology to peers for feedback and constructive criticism.'
      },
      {
        name: 'Implementation Phase 1',
        description: 'Begin implementation of your project with initial development and testing.',
        pageTitle: 'Implementation Strategies',
        pageContent: 'Learn effective implementation techniques, milestone tracking, and iterative development.',
        assignmentTitle: 'Initial Implementation',
        assignmentContent: 'Complete the first phase of your project implementation, documenting progress and challenges.',
        quizTitle: 'Implementation Progress Quiz',
        quizContent: 'Assess your understanding of implementation strategies and progress tracking methods.',
        discussionTitle: 'Implementation Challenges',
        discussionContent: 'Discuss implementation challenges and share solutions with your cohort.'
      },
      {
        name: 'Implementation Phase 2',
        description: 'Continue project implementation with refinements and advanced features.',
        pageTitle: 'Advanced Implementation',
        pageContent: 'Advanced implementation techniques, optimization strategies, and quality assurance methods.',
        assignmentTitle: 'Advanced Implementation',
        assignmentContent: 'Complete advanced features and optimizations, conduct thorough testing and validation.',
        quizTitle: 'Quality Assurance Quiz',
        quizContent: 'Test your knowledge of quality assurance, testing methodologies, and optimization techniques.',
        discussionTitle: 'Feature Development Discussion',
        discussionContent: 'Share your advanced implementations and get feedback on technical approaches.'
      },
      {
        name: 'Evaluation and Analysis',
        description: 'Evaluate project outcomes, analyze results, and assess impact.',
        pageTitle: 'Evaluation Methods',
        pageContent: 'Learn evaluation frameworks, impact assessment, and analytical techniques for project outcomes.',
        assignmentTitle: 'Project Evaluation Report',
        assignmentContent: 'Conduct comprehensive evaluation of your project, analyzing outcomes against initial objectives.',
        quizTitle: 'Evaluation Methods Quiz',
        quizContent: 'Assess your understanding of evaluation frameworks and analytical methodologies.',
        discussionTitle: 'Project Outcomes Discussion',
        discussionContent: 'Present your evaluation findings and discuss implications with peers.'
      },
      {
        name: 'Final Presentation and Reflection',
        description: 'Present your completed project and reflect on the learning experience.',
        pageTitle: 'Presentation Techniques',
        pageContent: 'Master presentation skills, storytelling, and effective communication of technical projects.',
        assignmentTitle: 'Final Project Presentation',
        assignmentContent: 'Deliver a comprehensive presentation of your project including methodology, implementation, and outcomes.',
        quizTitle: 'Project Reflection Quiz',
        quizContent: 'Reflect on your learning journey and assess your project management skills development.',
        discussionTitle: 'Learning Reflection',
        discussionContent: 'Share your learning experiences and insights gained throughout the project lifecycle.'
      }
    ],
    technical: [
      {
        name: 'Fundamentals and Setup',
        description: 'Introduction to core concepts and development environment setup.',
        pageTitle: 'Development Environment Setup',
        pageContent: 'Learn to set up your development environment, install necessary tools, and understand the technology stack.',
        assignmentTitle: 'Environment Setup and First Program',
        assignmentContent: 'Set up your development environment and create your first program following best practices.',
        quizTitle: 'Fundamentals Quiz',
        quizContent: 'Test your understanding of basic concepts, syntax, and development tools.',
        discussionTitle: 'Technology Stack Discussion',
        discussionContent: 'Discuss different technology choices and share setup experiences.'
      },
      {
        name: 'Core Programming Concepts',
        description: 'Master essential programming concepts and data structures.',
        pageTitle: 'Data Structures and Algorithms',
        pageContent: 'Explore fundamental data structures, algorithm complexity, and problem-solving strategies.',
        assignmentTitle: 'Algorithm Implementation',
        assignmentContent: 'Implement core algorithms and data structures, analyzing time and space complexity.',
        quizTitle: 'Data Structures Quiz',
        quizContent: 'Test your knowledge of arrays, linked lists, stacks, queues, and trees.',
        discussionTitle: 'Algorithm Efficiency Discussion',
        discussionContent: 'Compare different algorithmic approaches and discuss optimization strategies.'
      }
    ],
    humanities: [
      {
        name: 'Introduction to Critical Analysis',
        description: 'Develop skills in close reading, textual analysis, and critical thinking.',
        pageTitle: 'Critical Reading Strategies',
        pageContent: 'Learn techniques for close reading, identifying themes, and analyzing literary devices.',
        assignmentTitle: 'Text Analysis Essay',
        assignmentContent: 'Write a detailed analysis of a selected text, focusing on themes, style, and historical context.',
        quizTitle: 'Literary Terms Quiz',
        quizContent: 'Test your knowledge of literary devices, terminology, and analytical concepts.',
        discussionTitle: 'Interpretation Discussion',
        discussionContent: 'Share your interpretations of assigned readings and engage with diverse perspectives.'
      }
    ],
    science: [
      {
        name: 'Scientific Method and Research Design',
        description: 'Understand scientific methodology, hypothesis formation, and experimental design.',
        pageTitle: 'Research Design Principles',
        pageContent: 'Learn scientific method principles, hypothesis development, and experimental design best practices.',
        assignmentTitle: 'Research Proposal',
        assignmentContent: 'Develop a research proposal including hypothesis, methodology, and expected outcomes.',
        quizTitle: 'Scientific Method Quiz',
        quizContent: 'Test your understanding of scientific methodology and experimental design principles.',
        discussionTitle: 'Research Ethics Discussion',
        discussionContent: 'Discuss ethical considerations in scientific research and responsible conduct.'
      }
    ],
    business: [
      {
        name: 'Business Fundamentals',
        description: 'Introduction to core business concepts, market analysis, and strategic thinking.',
        pageTitle: 'Business Strategy Basics',
        pageContent: 'Explore fundamental business concepts, market dynamics, and strategic planning frameworks.',
        assignmentTitle: 'Market Analysis Report',
        assignmentContent: 'Conduct a comprehensive market analysis for a chosen industry or company.',
        quizTitle: 'Business Concepts Quiz',
        quizContent: 'Test your knowledge of business fundamentals, market analysis, and strategic concepts.',
        discussionTitle: 'Industry Trends Discussion',
        discussionContent: 'Analyze current industry trends and their implications for business strategy.'
      }
    ]
  };

  const moduleTemplates = baseModules[courseType as keyof typeof baseModules] || baseModules.project;
  const moduleIndex = Math.min(moduleNumber - 1, moduleTemplates.length - 1);
  
  return moduleTemplates[moduleIndex];
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

export function generateEnhancedCourseFromPrompt(prompt: string): Course {
  console.log('🔍 Enhanced parsing of course prompt...');
  
  // Enhanced parsing for various course description formats
  const courseInfo = parseUnstructuredCourseData(prompt);
  
  // Determine course type for specialized module generation
  const courseType = determineCourseType(courseInfo.name, courseInfo.description);
  console.log('📚 Detected course type:', courseType);
  
  // Set intelligent defaults based on parsed data
  const startDate = courseInfo.startDate || new Date('2025-06-03');
  const endDate = courseInfo.endDate || addWeeks(startDate, courseInfo.duration || 8);
  
  return generateCourse({
    name: courseInfo.name || 'New Course',
    courseCode: courseInfo.courseCode || 'NEW101',
    description: courseInfo.description || 'Course description',
    instructor: courseInfo.instructor || 'Course Instructor',
    term: courseInfo.term || 'Summer 2025',
    startDate,
    endDate,
    totalPoints: courseInfo.totalPoints || 1000
  });
}

function parseUnstructuredCourseData(prompt: string): any {
  const courseInfo: any = {};
  
  // Clean and normalize the input
  const lines = prompt.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const text = prompt.toLowerCase();
  
  // Extract course title and code patterns
  const titlePatterns = [
    /(?:course\s*title|title)\s*:?\s*(.+)/i,
    /^([A-Z]{2,5}\s+\d{3})\s+(.+)/i, // Pattern like "LDT 593 Applied Project"
    /^(.+?)\s+(\d{5})/i // Pattern with course number
  ];
  
  const codePatterns = [
    /\b([A-Z]{2,5}\s+\d{3})\b/i,
    /(?:course\s*code|number)\s*:?\s*([A-Z0-9\s]+)/i
  ];
  
  const instructorPatterns = [
    /(?:instructor(?:\(s\))?)\s*:?\s*(.+)/i,
    /(?:taught\s+by|professor)\s*:?\s*(.+)/i
  ];
  
  const descriptionPatterns = [
    /(?:course\s*description)\s*:?\s*(.+)/i,
    /(?:description)\s*:?\s*(.+)/i
  ];
  
  const datePatterns = [
    /(\d{1,2}\/\d{1,2})\s*-\s*(\d{1,2}\/\d{1,2})/i, // MM/DD - MM/DD format
    /(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/i // YYYY-MM-DD format
  ];
  
  const unitsPatterns = [
    /(?:units?|credits?)\s*:?\s*(\d+)/i
  ];
  
  // Extract course title
  for (const pattern of titlePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      if (match[1] && match[2]) {
        // Pattern with code and title
        courseInfo.courseCode = match[1].trim();
        courseInfo.name = match[2].trim();
      } else {
        courseInfo.name = match[1].trim();
      }
      break;
    }
  }
  
  // Extract course code if not already found
  if (!courseInfo.courseCode) {
    for (const pattern of codePatterns) {
      const match = prompt.match(pattern);
      if (match) {
        courseInfo.courseCode = match[1].trim();
        break;
      }
    }
  }
  
  // Extract instructor
  for (const pattern of instructorPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      courseInfo.instructor = match[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }
  
  // Extract description
  for (const pattern of descriptionPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      courseInfo.description = match[1].trim();
      break;
    }
  }
  
  // Extract dates
  for (const pattern of datePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      try {
        // Handle MM/DD format (assume current year)
        if (match[1].includes('/') && !match[1].includes('-')) {
          const currentYear = new Date().getFullYear();
          courseInfo.startDate = new Date(`${currentYear}-${match[1].replace('/', '-')}`);
          courseInfo.endDate = new Date(`${currentYear}-${match[2].replace('/', '-')}`);
        } else {
          courseInfo.startDate = new Date(match[1]);
          courseInfo.endDate = new Date(match[2]);
        }
        
        // Calculate duration in weeks
        if (courseInfo.startDate && courseInfo.endDate) {
          const diffTime = courseInfo.endDate.getTime() - courseInfo.startDate.getTime();
          courseInfo.duration = Math.ceil(diffTime / (1000 * 3600 * 24 * 7));
        }
      } catch (error) {
        console.log('Could not parse dates:', match);
      }
      break;
    }
  }
  
  // Extract units/credits
  for (const pattern of unitsPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      const units = parseInt(match[1]);
      courseInfo.units = units;
      // Estimate total points based on units (typical: 1 unit = 300-400 points)
      courseInfo.totalPoints = units * 350;
      break;
    }
  }
  
  // Extract term information
  if (text.includes('summer')) courseInfo.term = 'Summer 2025';
  else if (text.includes('fall')) courseInfo.term = 'Fall 2025';
  else if (text.includes('spring')) courseInfo.term = 'Spring 2025';
  else courseInfo.term = 'Summer 2025';
  
  // If no title found, try to extract from first significant line
  if (!courseInfo.name) {
    const significantLines = lines.filter(line => 
      line.length > 10 && 
      !line.toLowerCase().includes('course') &&
      !line.toLowerCase().includes('title') &&
      !line.toLowerCase().includes('number')
    );
    if (significantLines.length > 0) {
      courseInfo.name = significantLines[0];
    }
  }
  
  console.log('📊 Parsed course info:', courseInfo);
  return courseInfo;
}

function determineCourseType(courseName: string = '', description: string = ''): string {
  const text = `${courseName} ${description}`.toLowerCase();
  
  if (text.includes('applied project') || text.includes('capstone') || text.includes('thesis')) {
    return 'project';
  } else if (text.includes('programming') || text.includes('coding') || text.includes('software') || text.includes('computer science')) {
    return 'technical';
  } else if (text.includes('literature') || text.includes('writing') || text.includes('composition') || text.includes('english')) {
    return 'humanities';
  } else if (text.includes('science') || text.includes('lab') || text.includes('research') || text.includes('data')) {
    return 'science';
  } else if (text.includes('business') || text.includes('management') || text.includes('marketing')) {
    return 'business';
  } else if (text.includes('design') || text.includes('art') || text.includes('creative')) {
    return 'creative';
  }
  
  return 'general';
} 