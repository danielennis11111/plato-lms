import { Course, Module, ModuleItem } from './mockCanvasApi';
import { addDays, addWeeks, format } from 'date-fns';

interface DepartmentConfig {
  readingTypes: string[];
  assignmentTypes: string[];
  discussionTopics: string[];
  assessmentStyle: string;
  weeklyPattern: {
    pages: number;
    readings: number;
    discussions: number;
    assignments: number;
    quizzes: number;
  };
}

const DEPARTMENT_CONFIGS: { [key: string]: DepartmentConfig } = {
  'Computer Science': {
    readingTypes: ['documentation', 'research_paper', 'textbook', 'article'],
    assignmentTypes: ['Programming Project', 'Code Review', 'System Design', 'Algorithm Implementation', 'Web Development', 'Database Design'],
    discussionTopics: ['Best Practices', 'Technology Trends', 'Code Architecture', 'Open Source Discussion', 'Problem Solving'],
    assessmentStyle: 'practical',
    weeklyPattern: { pages: 1, readings: 2, discussions: 1, assignments: 1, quizzes: 1 }
  },
  'Mathematics': {
    readingTypes: ['textbook', 'research_paper', 'article'],
    assignmentTypes: ['Problem Set', 'Proof Assignment', 'Mathematical Modeling', 'Computational Exercise', 'Research Paper'],
    discussionTopics: ['Mathematical Concepts', 'Real-world Applications', 'Problem Solving Strategies', 'Mathematical History'],
    assessmentStyle: 'theoretical',
    weeklyPattern: { pages: 1, readings: 1, discussions: 1, assignments: 1, quizzes: 1 }
  },
  'English': {
    readingTypes: ['textbook', 'article', 'research_paper'],
    assignmentTypes: ['Literary Analysis', 'Creative Writing', 'Research Paper', 'Critical Essay', 'Comparative Analysis'],
    discussionTopics: ['Literary Interpretation', 'Writing Techniques', 'Cultural Context', 'Author Study', 'Genre Analysis'],
    assessmentStyle: 'analytical',
    weeklyPattern: { pages: 1, readings: 2, discussions: 1, assignments: 1, quizzes: 1 }
  },
  'Spanish': {
    readingTypes: ['textbook', 'article', 'website'],
    assignmentTypes: ['Oral Presentation', 'Written Composition', 'Grammar Exercise', 'Cultural Project', 'Translation Exercise'],
    discussionTopics: ['Cultural Exchange', 'Language Practice', 'Current Events', 'Literature Discussion', 'Travel Experiences'],
    assessmentStyle: 'communicative',
    weeklyPattern: { pages: 1, readings: 1, discussions: 1, assignments: 1, quizzes: 1 }
  },
  'French': {
    readingTypes: ['textbook', 'article', 'website'],
    assignmentTypes: ['Oral Assessment', 'Written Assignment', 'Cultural Analysis', 'Language Exchange', 'Pronunciation Practice'],
    discussionTopics: ['French Culture', 'Language Learning', 'Francophone Countries', 'Literature', 'Current Affairs'],
    assessmentStyle: 'communicative',
    weeklyPattern: { pages: 1, readings: 1, discussions: 1, assignments: 1, quizzes: 1 }
  }
};

interface SemesterSchedule {
  startDate: Date;
  endDate: Date;
  weeks: number;
  moduleCount: number;
}

export class ComprehensiveCourseGenerator {
  private static SEMESTER_SCHEDULE: SemesterSchedule = {
    startDate: new Date('2025-01-13'), // Spring 2025
    endDate: new Date('2025-05-02'),
    weeks: 15,
    moduleCount: 8
  };

  static generateComprehensiveCourse(baseCourse: Course): Course {
    const config = DEPARTMENT_CONFIGS[baseCourse.department] || DEPARTMENT_CONFIGS['Computer Science'];
    const modules = this.generateModules(baseCourse, config);
    
    return {
      ...baseCourse,
      modules,
      start_date: format(this.SEMESTER_SCHEDULE.startDate, 'yyyy-MM-dd'),
      end_date: format(this.SEMESTER_SCHEDULE.endDate, 'yyyy-MM-dd'),
      term: 'Spring 2025',
      total_points: this.calculateTotalPoints(modules)
    };
  }

  private static generateModules(course: Course, config: DepartmentConfig): Module[] {
    const modules: Module[] = [];
    const weeksPerModule = Math.floor(this.SEMESTER_SCHEDULE.weeks / this.SEMESTER_SCHEDULE.moduleCount);
    
    for (let i = 0; i < this.SEMESTER_SCHEDULE.moduleCount; i++) {
      const moduleStartWeek = i * weeksPerModule;
      const moduleStartDate = addWeeks(this.SEMESTER_SCHEDULE.startDate, moduleStartWeek);
      
      const module = this.generateModule(
        i + 1,
        course,
        config,
        moduleStartDate,
        weeksPerModule
      );
      
      modules.push(module);
    }
    
    return modules;
  }

  private static generateModule(
    moduleNumber: number,
    course: Course,
    config: DepartmentConfig,
    startDate: Date,
    weeksInModule: number
  ): Module {
    const moduleTopics = this.getModuleTopics(course.department, course.name, moduleNumber);
    const items: ModuleItem[] = [];
    let itemId = moduleNumber * 100;

    // Week structure for each module (usually 2 weeks per module)
    for (let week = 0; week < weeksInModule; week++) {
      const weekDate = addWeeks(startDate, week);
      
      // Introduction page (first week only)
      if (week === 0) {
        items.push(this.generateIntroductionPage(
          itemId++,
          moduleTopics.title,
          moduleTopics.overview,
          weekDate
        ));
      }

      // Readings (1-2 per week)
      for (let r = 0; r < config.weeklyPattern.readings; r++) {
        items.push(this.generateReading(
          itemId++,
          moduleTopics.title,
          config.readingTypes,
          addDays(weekDate, r * 2),
          course.department
        ));
      }

      // Discussion (weekly)
      items.push(this.generateDiscussion(
        itemId++,
        config.discussionTopics,
        moduleTopics.title,
        addDays(weekDate, 3),
        course.department
      ));

      // Assignment (weekly)
      items.push(this.generateAssignment(
        itemId++,
        config.assignmentTypes,
        moduleTopics.title,
        addDays(weekDate, 5),
        course.department,
        moduleNumber
      ));

      // Quiz (end of module)
      if (week === weeksInModule - 1) {
        items.push(this.generateQuiz(
          itemId++,
          moduleTopics.title,
          addDays(weekDate, 6),
          course.department
        ));
      }
    }

    return {
      id: moduleNumber,
      name: `Module ${moduleNumber}: ${moduleTopics.title}`,
      description: moduleTopics.overview,
      items,
      due_date: format(addWeeks(startDate, weeksInModule), 'yyyy-MM-dd'),
      is_completed: false
    };
  }

  private static generateIntroductionPage(
    id: number,
    topic: string,
    overview: string,
    date: Date
  ): ModuleItem {
    return {
      id,
      title: `Introduction to ${topic}`,
      type: 'page',
      content: `<div class="module-introduction">
        <h2>Welcome to ${topic}</h2>
        <p>${overview}</p>
        
        <h3>Learning Objectives</h3>
        <ul>
          <li>Understand the fundamental concepts of ${topic.toLowerCase()}</li>
          <li>Apply theoretical knowledge to practical scenarios</li>
          <li>Develop critical thinking skills related to ${topic.toLowerCase()}</li>
          <li>Engage with peers in meaningful discussions</li>
        </ul>
        
        <h3>This Module's Activities</h3>
        <p>This module includes readings, discussions, assignments, and assessments designed to build your understanding progressively. Please complete activities in the suggested order for the best learning experience.</p>
        
        <div class="success-tips">
          <h4>Tips for Success</h4>
          <ul>
            <li>Start early and pace yourself throughout the module</li>
            <li>Engage actively in discussions with your classmates</li>
            <li>Don't hesitate to ask questions if concepts are unclear</li>
            <li>Take advantage of office hours and additional resources</li>
          </ul>
        </div>
      </div>`,
      due_date: format(date, 'yyyy-MM-dd'),
      status: 'not_started',
      points_possible: 0
    };
  }

  private static generateReading(
    id: number,
    topic: string,
    readingTypes: string[],
    date: Date,
    department: string
  ): ModuleItem {
    const type = readingTypes[Math.floor(Math.random() * readingTypes.length)];
    const readings = this.getReadingContent(department, topic, type);
    
    return {
      id,
      title: readings.title,
      type: 'reading',
      content: readings.description,
      due_date: format(date, 'yyyy-MM-dd'),
      status: 'not_started',
      points_possible: 0,
      reading_details: readings.details
    };
  }

  private static generateDiscussion(
    id: number,
    discussionTopics: string[],
    moduleTopic: string,
    date: Date,
    department: string
  ): ModuleItem {
    const baseTopics = discussionTopics[Math.floor(Math.random() * discussionTopics.length)];
    const discussion = this.getDiscussionContent(department, moduleTopic, baseTopics);
    
    return {
      id,
      title: discussion.title,
      type: 'discussion',
      content: discussion.prompt,
      due_date: format(date, 'yyyy-MM-dd'),
      status: 'not_started',
      points_possible: 25
    };
  }

  private static generateAssignment(
    id: number,
    assignmentTypes: string[],
    topic: string,
    date: Date,
    department: string,
    moduleNumber: number
  ): ModuleItem {
    const type = assignmentTypes[Math.floor(Math.random() * assignmentTypes.length)];
    const assignment = this.getAssignmentContent(department, topic, type, moduleNumber);
    
    return {
      id,
      title: assignment.title,
      type: 'assignment',
      content: assignment.description,
      due_date: format(date, 'yyyy-MM-dd'),
      status: 'not_started',
      points_possible: assignment.points,
      max_attempts: 3,
      submissions: 0,
      attempts: 0
    };
  }

  private static generateQuiz(
    id: number,
    topic: string,
    date: Date,
    department: string
  ): ModuleItem {
    return {
      id,
      title: `${topic} Assessment`,
      type: 'quiz',
      content: `Comprehensive assessment covering key concepts from ${topic.toLowerCase()}. This quiz will test your understanding of the material covered in this module.`,
      due_date: format(date, 'yyyy-MM-dd'),
      status: 'not_started',
      points_possible: 50,
      max_attempts: 2,
      attempts: 0
    };
  }

  private static getModuleTopics(department: string, courseName: string, moduleNumber: number) {
    const topics = {
      'Computer Science': {
        'Advanced Web Development': [
          { title: 'Modern React Fundamentals', overview: 'Deep dive into React hooks, context, and modern development patterns' },
          { title: 'State Management Systems', overview: 'Redux, Zustand, and advanced state management techniques' },
          { title: 'Backend Integration', overview: 'API design, authentication, and full-stack development' },
          { title: 'Performance Optimization', overview: 'Code splitting, lazy loading, and performance monitoring' },
          { title: 'Testing Strategies', overview: 'Unit testing, integration testing, and E2E testing' },
          { title: 'Deployment & DevOps', overview: 'CI/CD pipelines, containerization, and cloud deployment' },
          { title: 'Advanced Patterns', overview: 'Design patterns, architecture, and scalability' },
          { title: 'Final Project', overview: 'Comprehensive full-stack application development' }
        ],
        'Data Structures': [
          { title: 'Arrays and Linked Lists', overview: 'Fundamental data structures and their operations' },
          { title: 'Stacks and Queues', overview: 'LIFO and FIFO data structures with practical applications' },
          { title: 'Trees and Binary Search Trees', overview: 'Hierarchical data structures and tree traversal algorithms' },
          { title: 'Hash Tables and Maps', overview: 'Hash functions, collision resolution, and dictionary operations' },
          { title: 'Graphs and Graph Algorithms', overview: 'Graph representation and fundamental graph algorithms' },
          { title: 'Heaps and Priority Queues', overview: 'Binary heaps and priority-based data structures' },
          { title: 'Advanced Trees', overview: 'AVL trees, B-trees, and self-balancing structures' },
          { title: 'Algorithm Analysis', overview: 'Time complexity, space complexity, and optimization techniques' }
        ]
      },
      'Mathematics': {
        'Calculus I': [
          { title: 'Limits and Continuity', overview: 'Introduction to limits, limit laws, and continuity of functions' },
          { title: 'Derivatives and Rules', overview: 'Definition of derivatives and fundamental differentiation rules' },
          { title: 'Applications of Derivatives', overview: 'Related rates, optimization, and curve sketching' },
          { title: 'The Integral', overview: 'Antiderivatives and the fundamental theorem of calculus' },
          { title: 'Integration Techniques', overview: 'Substitution, integration by parts, and special techniques' },
          { title: 'Applications of Integration', overview: 'Area, volume, and physical applications of integrals' },
          { title: 'Differential Equations', overview: 'Basic differential equations and their applications' },
          { title: 'Sequences and Series', overview: 'Infinite sequences, series, and convergence tests' }
        ]
      },
      'English': {
        'Introduction to Literature': [
          { title: 'Literary Elements', overview: 'Understanding plot, character, setting, and theme in literature' },
          { title: 'Poetry Analysis', overview: 'Analyzing poetic devices, form, and meaning in poetry' },
          { title: 'Short Fiction', overview: 'Examining narrative techniques in short stories' },
          { title: 'Drama and Theater', overview: 'Understanding dramatic structure and theatrical elements' },
          { title: 'Novel Study', overview: 'In-depth analysis of novel structure and development' },
          { title: 'Literary Criticism', overview: 'Introduction to critical approaches and literary theory' },
          { title: 'Contemporary Literature', overview: 'Modern and contemporary literary movements' },
          { title: 'Research and Writing', overview: 'Advanced literary analysis and research skills' }
        ]
      }
    };

    const courseTopics = (topics as any)[department]?.[courseName] || [
      { title: `Fundamentals`, overview: 'Introduction to fundamental concepts and principles' },
      { title: `Core Concepts`, overview: 'Building upon fundamental knowledge with core concepts' },
      { title: `Advanced Topics`, overview: 'Exploring advanced topics and applications' },
      { title: `Practical Applications`, overview: 'Applying knowledge to real-world scenarios' },
      { title: `Analysis and Synthesis`, overview: 'Analyzing and synthesizing complex information' },
      { title: `Contemporary Issues`, overview: 'Examining current trends and developments' },
      { title: `Research and Innovation`, overview: 'Engaging in research and innovative thinking' },
      { title: `Integration and Assessment`, overview: 'Integrating knowledge and comprehensive assessment' }
    ];

    return courseTopics[moduleNumber - 1] || courseTopics[0];
  }

  private static getReadingContent(department: string, topic: string, type: string) {
    const readings = {
      'Computer Science': {
        textbook: {
          title: `${topic} - Textbook Reading`,
          description: `Read assigned chapters covering ${topic.toLowerCase()} concepts, implementation details, and best practices.`,
          details: {
            source: 'Course Textbook',
            pages: '45-67',
            estimated_time: 60,
            type: 'textbook' as const
          }
        },
        documentation: {
          title: `${topic} - Official Documentation`,
          description: `Review official documentation and API references related to ${topic.toLowerCase()}.`,
          details: {
            source: 'Official Documentation',
            url: 'https://docs.example.com',
            estimated_time: 30,
            type: 'website' as const
          }
        }
      }
    };

    const departmentReadings = (readings as any)[department] || readings['Computer Science'];
    return departmentReadings[type] || departmentReadings.textbook;
  }

  private static getDiscussionContent(department: string, topic: string, baseType: string) {
    return {
      title: `${baseType}: ${topic}`,
      prompt: `Discuss your understanding of ${topic.toLowerCase()} and its applications. Share examples, ask questions, and engage with your classmates' perspectives.

Initial Post Requirements:
- Minimum 200 words
- Include at least one specific example
- Reference course materials
- Pose a thoughtful question for further discussion

Response Requirements:
- Respond to at least 2 classmates
- Build upon their ideas with substantive comments
- Maintain respectful and academic discourse`
    };
  }

  private static getAssignmentContent(department: string, topic: string, type: string, moduleNumber: number) {
    const assignments: any = {
      'Computer Science': {
        'Programming Project': {
          title: `${topic} Programming Project`,
          description: `Implement a comprehensive project demonstrating ${topic.toLowerCase()} concepts.

Requirements:
- Complete implementation with all required features
- Well-commented code following best practices
- README file with setup and usage instructions
- Unit tests covering core functionality
- Proper version control with meaningful commit messages

Deliverables:
- Source code repository link
- Deployed application (if applicable)
- Technical documentation
- Video demonstration (3-5 minutes)`,
          points: 100
        },
        'Code Review': {
          title: `${topic} Code Review Assignment`,
          description: `Conduct a thorough code review of provided code samples related to ${topic.toLowerCase()}.`,
          points: 75
        }
      },
      'Mathematics': {
        'Problem Set': {
          title: `${topic} Problem Set`,
          description: `Complete the assigned problem set covering ${topic.toLowerCase()}. Show all work and explanations.`,
          points: 80
        }
      }
    };

    const departmentAssignments = assignments[department] || assignments['Computer Science'];
    const assignmentType = departmentAssignments[type] || departmentAssignments['Programming Project'];
    
    return {
      ...assignmentType,
      points: Math.floor(assignmentType.points * (1 + moduleNumber * 0.1))
    };
  }

  private static calculateTotalPoints(modules: Module[]): number {
    return modules.reduce((total, module) => {
      return total + module.items.reduce((moduleTotal, item) => {
        return moduleTotal + (item.points_possible || 0);
      }, 0);
    }, 0);
  }
} 