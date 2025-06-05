import { mockCanvasApi, Course } from './mockCanvasApi';

export class CourseEnhancementService {
  /**
   * Enhance all courses in the system with comprehensive semester-long content
   */
  static async enhanceAllCourses(): Promise<void> {
    console.log('🚀 Starting comprehensive course enhancement...');
    
    try {
      // Get all existing courses
      const courses = await mockCanvasApi.getCourses();
      console.log(`📚 Found ${courses.length} courses to enhance`);
      
      for (const course of courses) {
        try {
          console.log(`🔄 Enhancing course: ${course.course_code} - ${course.name}`);
          
          // Generate comprehensive content for this course
          const enhancedCourse = this.generateComprehensiveCourse(course);
          
          // Update the course in the system
          await this.updateCourseContent(course.id, enhancedCourse);
          
          console.log(`✅ Successfully enhanced ${course.course_code}`);
          
        } catch (courseError) {
          console.error(`❌ Failed to enhance course ${course.course_code}:`, courseError);
        }
      }
      
      console.log('🎉 Course enhancement completed!');
      
    } catch (error) {
      console.error('❌ Course enhancement failed:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive course content for a single course
   */
  private static generateComprehensiveCourse(baseCourse: Course): Course {
    const departmentConfigs: { [key: string]: any } = {
      'Computer Science': {
        assignmentTypes: ['Programming Project', 'Code Review', 'System Design'],
        discussionTopics: ['Best Practices', 'Technology Trends', 'Code Architecture']
      },
      'Mathematics': {
        assignmentTypes: ['Problem Set', 'Proof Assignment', 'Mathematical Modeling'],
        discussionTopics: ['Mathematical Concepts', 'Real-world Applications']
      },
      'English': {
        assignmentTypes: ['Literary Analysis', 'Creative Writing', 'Research Paper'],
        discussionTopics: ['Literary Interpretation', 'Writing Techniques']
      }
    };

    const config = departmentConfigs[baseCourse.department] || departmentConfigs['Computer Science'];
    const modules = this.generateModules(baseCourse, config);
    
    return {
      ...baseCourse,
      modules,
      start_date: '2025-01-13',
      end_date: '2025-05-02',
      term: 'Spring 2025',
      total_points: this.calculateTotalPoints(modules)
    };
  }

  /**
   * Generate 8 comprehensive modules for a full semester course
   */
  private static generateModules(course: Course, config: any) {
    const modules = [];
    const moduleTopics = this.getModuleTopics(course.department, course.name);
    
    for (let i = 0; i < 8; i++) {
      const moduleStartDate = new Date('2025-01-13');
      moduleStartDate.setDate(moduleStartDate.getDate() + (i * 14)); // 2 weeks per module
      
      const module = {
        id: i + 1,
        name: `Module ${i + 1}: ${moduleTopics[i]?.title || 'Advanced Topics'}`,
        description: moduleTopics[i]?.overview || 'Comprehensive study of advanced concepts',
        items: this.generateModuleItems(i + 1, moduleTopics[i], config, moduleStartDate),
        due_date: new Date(moduleStartDate.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        is_completed: false
      };
      
      modules.push(module);
    }
    
    return modules;
  }

  /**
   * Generate items for each module (readings, assignments, discussions, quizzes)
   */
  private static generateModuleItems(moduleNumber: number, topic: any, config: any, startDate: Date) {
    const items = [];
    let itemId = moduleNumber * 100;
    
    // Introduction page
    items.push({
      id: itemId++,
      title: `Introduction to ${topic?.title || 'Module Content'}`,
      type: 'page' as const,
      content: this.generateModuleIntroduction(topic),
      due_date: startDate.toISOString().split('T')[0],
      status: 'not_started' as const,
      points_possible: 0
    });

    // Readings
    for (let r = 0; r < 2; r++) {
      const readingDate = new Date(startDate);
      readingDate.setDate(readingDate.getDate() + (r * 3));
      
      items.push({
        id: itemId++,
        title: `${topic?.title || 'Module'} Reading ${r + 1}`,
        type: 'reading' as const,
        content: this.generateReadingContent(topic),
        due_date: readingDate.toISOString().split('T')[0],
        status: 'not_started' as const,
        points_possible: 0,
        reading_details: {
          source: 'Course Materials',
          pages: `${45 + r * 20}-${65 + r * 20}`,
          estimated_time: 45 + r * 15,
          type: 'textbook' as const
        }
      });
    }

    // Discussion
    const discussionDate = new Date(startDate);
    discussionDate.setDate(discussionDate.getDate() + 5);
    
    items.push({
      id: itemId++,
      title: `Discussion: ${topic?.title || 'Module Topics'}`,
      type: 'discussion',
      content: this.generateDiscussionPrompt(topic, config.discussionTopics),
      due_date: discussionDate.toISOString().split('T')[0],
      status: 'not_started',
      points_possible: 25
    });

    // Assignment
    const assignmentDate = new Date(startDate);
    assignmentDate.setDate(assignmentDate.getDate() + 10);
    
    items.push({
      id: itemId++,
      title: `${topic?.title || 'Module'} ${config.assignmentTypes[moduleNumber % config.assignmentTypes.length]}`,
      type: 'assignment',
      content: this.generateAssignmentContent(topic, config.assignmentTypes[moduleNumber % config.assignmentTypes.length]),
      due_date: assignmentDate.toISOString().split('T')[0],
      status: 'not_started',
      points_possible: 100 + (moduleNumber * 10),
      max_attempts: 3,
      submissions: 0,
      attempts: 0
    });

    // Quiz
    const quizDate = new Date(startDate);
    quizDate.setDate(quizDate.getDate() + 13);
    
    items.push({
      id: itemId++,
      title: `${topic?.title || 'Module'} Assessment`,
      type: 'quiz',
      content: `Assessment covering ${topic?.title?.toLowerCase() || 'module content'}`,
      due_date: quizDate.toISOString().split('T')[0],
      status: 'not_started',
      points_possible: 50,
      max_attempts: 2,
      attempts: 0
    });

    return items;
  }

  /**
   * Get topic progression for different courses and departments
   */
  private static getModuleTopics(department: string, courseName: string) {
    const courseTopics: { [key: string]: any } = {
      'Computer Science': {
        'Advanced Web Development': [
          { title: 'Modern React Fundamentals', overview: 'Deep dive into React hooks and modern patterns' },
          { title: 'State Management', overview: 'Redux, Zustand, and advanced state management' },
          { title: 'Backend Integration', overview: 'API design, authentication, and full-stack development' },
          { title: 'Performance Optimization', overview: 'Code splitting, lazy loading, and monitoring' },
          { title: 'Testing Strategies', overview: 'Unit, integration, and E2E testing' },
          { title: 'Deployment & DevOps', overview: 'CI/CD pipelines and cloud deployment' },
          { title: 'Advanced Patterns', overview: 'Design patterns and architecture' },
          { title: 'Final Project', overview: 'Comprehensive application development' }
        ]
      },
      'Mathematics': {
        'Calculus I': [
          { title: 'Limits and Continuity', overview: 'Introduction to limits and continuity' },
          { title: 'Derivatives', overview: 'Definition and rules of differentiation' },
          { title: 'Applications of Derivatives', overview: 'Optimization and related rates' },
          { title: 'Integration', overview: 'Antiderivatives and definite integrals' },
          { title: 'Integration Techniques', overview: 'Advanced integration methods' },
          { title: 'Applications of Integration', overview: 'Area, volume, and physics applications' },
          { title: 'Differential Equations', overview: 'Basic differential equations' },
          { title: 'Series and Sequences', overview: 'Infinite series and convergence' }
        ]
      }
    };

    // Get department-specific topics, then course-specific, or fallback to generic
    const departmentTopics = courseTopics[department];
    if (departmentTopics && departmentTopics[courseName]) {
      return departmentTopics[courseName];
    }
    
    // Fallback to generic progressive topics
    return [
      { title: 'Fundamentals', overview: 'Introduction to fundamental concepts' },
      { title: 'Core Concepts', overview: 'Building core knowledge' },
      { title: 'Advanced Topics', overview: 'Exploring advanced applications' },
      { title: 'Practical Applications', overview: 'Real-world applications' },
      { title: 'Analysis', overview: 'Critical analysis and synthesis' },
      { title: 'Contemporary Issues', overview: 'Current trends and developments' },
      { title: 'Research', overview: 'Research and innovation' },
      { title: 'Integration', overview: 'Comprehensive integration' }
    ];
  }

  private static generateModuleIntroduction(topic: any) {
    return `<div class="module-introduction">
      <h2>Welcome to ${topic?.title || 'This Module'}</h2>
      <p>${topic?.overview || 'Explore important concepts and develop essential skills.'}</p>
      
      <h3>Learning Objectives</h3>
      <ul>
        <li>Understand fundamental concepts</li>
        <li>Apply theoretical knowledge practically</li>
        <li>Develop critical thinking skills</li>
        <li>Engage in meaningful discussions</li>
      </ul>
    </div>`;
  }

  private static generateReadingContent(topic: any) {
    return `Read assigned materials covering ${topic?.title?.toLowerCase() || 'key concepts'}. Focus on core concepts, practical applications, and connections to previous learning.`;
  }

  private static generateDiscussionPrompt(topic: any, discussionTopics: string[]) {
    const selectedTopic = discussionTopics[Math.floor(Math.random() * discussionTopics.length)];
    
    return `Discuss ${topic?.title?.toLowerCase() || 'module content'} focusing on ${selectedTopic.toLowerCase()}.

Requirements:
- Initial post: 200+ words with specific examples
- Respond to 2 classmates with substantive comments
- Reference course materials`;
  }

  private static generateAssignmentContent(topic: any, assignmentType: string) {
    return `Complete this ${assignmentType.toLowerCase()} focusing on ${topic?.title?.toLowerCase() || 'module concepts'}.

Requirements:
- Demonstrate understanding of key concepts
- Apply knowledge to practical scenarios
- Follow academic standards
- Submit by due date`;
  }

  /**
   * Update course content in the mock API
   */
  private static async updateCourseContent(courseId: number, enhancedCourse: Course): Promise<void> {
    // In a real system, this would update the database
    // For now, we'll update the in-memory course data
    const courses = await mockCanvasApi.getCourses();
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
      // Update the course with enhanced content
      (courses as any)[courseIndex] = enhancedCourse;
    }
  }

  /**
   * Calculate total points for all modules
   */
  private static calculateTotalPoints(modules: any[]): number {
    return modules.reduce((total, module) => {
      return total + module.items.reduce((moduleTotal: number, item: any) => {
        return moduleTotal + (item.points_possible || 0);
      }, 0);
    }, 0);
  }
} 