import { SyllabusGenerator } from './syllabusGenerator';
import { Course, Assignment, Module } from './mockCanvasApi';

export class SyllabusEnhancer {
  
  // Main function to enhance all courses with syllabi
  static enhanceAllCourses(courses: Course[]): Course[] {
    console.log('🔄 Starting systematic course enhancement...');
    
    return courses.map(course => {
      console.log(`📚 Enhancing ${course.name} (${course.course_code})`);
      return this.enhanceCourse(course);
    });
  }

  // Enhance a single course with generated syllabus and improved content
  static enhanceCourse(course: Course): Course {
    const enhancedSyllabus = SyllabusGenerator.generateSyllabus(course);
    const enhancedModules = this.enhanceModules(course);
    
    return {
      ...course,
      syllabus: enhancedSyllabus,
      modules: enhancedModules,
    };
  }

  // Generate enhanced modules with better structure and content
  static enhanceModules(course: Course): Module[] {
    const template = SyllabusGenerator.getSyllabusTemplate(course);
    const existingModules = course.modules || [];
    
    // Use existing modules if they're comprehensive, otherwise generate new ones
    if (existingModules.length >= 3 && existingModules.some(m => m.items && m.items.length > 2)) {
      return existingModules.map(module => ({
        ...module,
        description: this.enhanceModuleDescription(course, module),
        items: this.enhanceModuleItems(course, module)
      }));
    }

    // Generate new modules based on weekly topics from syllabus template
    return template.weeklyTopics.slice(0, 4).map((week, index) => ({
      id: index + 1,
      name: week.topic,
      description: `Module ${index + 1}: ${week.topic} - ${week.learningGoals.join(', ')}`,
      due_date: this.getModuleDueDate(index),
      is_completed: index === 0, // First module completed as example
      items: this.generateModuleItems(course, week, index + 1)
    }));
  }

  // Enhance existing module descriptions
  static enhanceModuleDescription(course: Course, module: Module): string {
    const departmentContext = {
      'Computer Science': 'This programming module focuses on hands-on coding and theoretical understanding.',
      'Mathematics': 'This mathematical module emphasizes problem-solving and conceptual mastery.',
      'English': 'This literature module develops critical reading and analytical writing skills.',
      'TCLAS School of International Letters and Cultures': 'This language module builds communication skills through immersive practice.'
    };

    const baseDescription = departmentContext[course.department as keyof typeof departmentContext] || 
      'This module covers essential course concepts and practical applications.';

    return `${baseDescription} Students will explore ${module.name.toLowerCase()} through a combination of theoretical study and practical exercises.`;
  }

  // Generate high-quality module items
  static generateModuleItems(course: Course, weekTopic: any, moduleId: number): any[] {
    const items = [];
    
    // Reading assignment
    items.push({
      id: moduleId * 10 + 1,
      title: `${weekTopic.topic} - Required Reading`,
      type: 'page',
      content: this.generateReadingContent(course, weekTopic),
      due_date: this.getModuleDueDate(moduleId - 1, -2),
      status: 'not_started',
      points_possible: 0
    });

    // Practice assignment
    items.push({
      id: moduleId * 10 + 2,
      title: `${weekTopic.topic} - Practice Assignment`,
      type: 'assignment',
      content: this.generateAssignmentContent(course, weekTopic),
      due_date: this.getModuleDueDate(moduleId - 1, 3),
      status: moduleId === 1 ? 'graded' : 'not_started',
      grade: moduleId === 1 ? 87 : undefined,
      feedback: moduleId === 1 ? 'Good understanding of core concepts. Consider exploring additional examples.' : undefined,
      points_possible: 75
    });

    // Quiz
    items.push({
      id: moduleId * 10 + 3,
      title: `${weekTopic.topic} - Knowledge Check`,
      type: 'quiz',
      content: this.generateQuizContent(course, weekTopic),
      due_date: this.getModuleDueDate(moduleId - 1, 5),
      status: moduleId === 1 ? 'graded' : 'not_started',
      grade: moduleId === 1 ? 92 : undefined,
      feedback: moduleId === 1 ? 'Excellent grasp of fundamental concepts!' : undefined,
      points_possible: 50
    });

    return items;
  }

  // Content generators for different item types
  static generateReadingContent(course: Course, weekTopic: any): string {
    const readingTypes = {
      'Computer Science': `Essential reading on ${weekTopic.topic.toLowerCase()} covering theoretical foundations and practical implementations. Focus on understanding core algorithms, design patterns, and best practices in modern software development.`,
      
      'Mathematics': `Required reading covering ${weekTopic.topic.toLowerCase()} with emphasis on theorem understanding, proof techniques, and problem-solving strategies. Includes worked examples and step-by-step explanations.`,
      
      'English': `Literary texts and critical essays exploring ${weekTopic.topic.toLowerCase()}. Students will analyze narrative techniques, thematic elements, and historical contexts while developing close reading skills.`,
      
      'TCLAS School of International Letters and Cultures': `Textbook chapters and multimedia resources for ${weekTopic.topic.toLowerCase()}. Includes pronunciation guides, cultural context explanations, and interactive exercises for language practice.`
    };

    return readingTypes[course.department as keyof typeof readingTypes] || 
      `Comprehensive reading materials covering ${weekTopic.topic.toLowerCase()} concepts and applications.`;
  }

  static generateAssignmentContent(course: Course, weekTopic: any): string {
    const assignmentTypes = {
      'Computer Science': `Implement a solution demonstrating ${weekTopic.topic.toLowerCase()} concepts. Your code should include proper error handling, documentation, and testing. Submit source files with README explaining your approach and any challenges encountered.`,
      
      'Mathematics': `Complete the ${weekTopic.topic.toLowerCase()} problem set, showing all work and explaining your reasoning. Focus on applying techniques learned in class to solve both theoretical and applied problems. Include verification of your answers where possible.`,
      
      'English': `Write a 500-750 word analysis exploring ${weekTopic.topic.toLowerCase()} in the assigned texts. Develop a clear thesis supported by specific textual evidence. Use MLA format for citations and include a works cited page.`,
      
      'TCLAS School of International Letters and Cultures': `Practice ${weekTopic.topic.toLowerCase()} through structured exercises including character writing, pronunciation recording, and cultural context exploration. Submit audio recordings and written responses.`
    };

    return assignmentTypes[course.department as keyof typeof assignmentTypes] || 
      `Complete practical exercises demonstrating understanding of ${weekTopic.topic.toLowerCase()} concepts.`;
  }

  static generateQuizContent(course: Course, weekTopic: any): string {
    return `Assessment covering ${weekTopic.topic.toLowerCase()} learning objectives including ${weekTopic.learningGoals?.join(', ') || 'key concepts'}. Quiz format includes multiple choice, short answer, and practical application questions.`;
  }

  // Generate enhanced module items for existing modules
  static enhanceModuleItems(course: Course, module: Module): any[] {
    const existingItems = module.items || [];
    
    return existingItems.map(item => ({
      ...item,
      content: this.enhanceItemContent(course, module, item),
      points_possible: item.points_possible || this.getDefaultPoints(item.type)
    }));
  }

  static enhanceItemContent(course: Course, module: Module, item: any): string {
    if (item.content && item.content.length > 50) {
      return item.content; // Keep existing detailed content
    }

    // Generate enhanced content for sparse items
    const contentEnhancers = {
      'assignment': () => this.generateAssignmentContent(course, { topic: module.name, learningGoals: ['Understanding core concepts'] }),
      'quiz': () => this.generateQuizContent(course, { topic: module.name }),
      'discussion': () => this.generateDiscussionContent(course, { topic: module.name }),
      'page': () => this.generateReadingContent(course, { topic: module.name })
    };

    return contentEnhancers[item.type as keyof typeof contentEnhancers]?.() || 
      item.content || 
      `Study materials for ${module.name} covering essential concepts and practical applications.`;
  }

  static generateDiscussionContent(course: Course, weekTopic: any): string {
    const discussionPrompts = {
      'Computer Science': `Discuss the real-world applications of ${weekTopic.topic.toLowerCase()}. Share examples of how these concepts are used in industry and analyze the benefits and challenges of different implementation approaches.`,
      
      'Mathematics': `Explore the practical applications of ${weekTopic.topic.toLowerCase()} in various fields. Discuss how these mathematical concepts solve real-world problems and share interesting examples you've discovered.`,
      
      'English': `Analyze how ${weekTopic.topic.toLowerCase()} reflects broader cultural and historical themes. Discuss the effectiveness of different literary techniques and share your interpretations of key passages.`,
      
      'TCLAS School of International Letters and Cultures': `Share your experiences practicing ${weekTopic.topic.toLowerCase()} and discuss cultural insights you've gained. Help classmates with pronunciation or grammar questions and share useful learning strategies.`
    };

    return discussionPrompts[course.department as keyof typeof discussionPrompts] || 
      `Engage in collaborative discussion about ${weekTopic.topic.toLowerCase()} concepts and their applications.`;
  }

  // Utility functions
  static getModuleDueDate(moduleIndex: number, dayOffset: number = 0): string {
    const today = new Date('2025-06-04');
    const moduleStartWeek = moduleIndex * 7; // Each module is roughly a week
    const dueDate = new Date(today.getTime() + (moduleStartWeek + dayOffset) * 24 * 60 * 60 * 1000);
    return dueDate.toISOString();
  }

  static getDefaultPoints(itemType: string): number {
    const pointsMap = {
      'assignment': 75,
      'quiz': 50,
      'discussion': 25,
      'page': 0
    };
    return pointsMap[itemType as keyof typeof pointsMap] || 50;
  }

  // Function to preview enhancement for a single course
  static previewEnhancement(course: Course): { 
    syllabus: string; 
    moduleCount: number; 
    improvements: string[] 
  } {
    const enhanced = this.enhanceCourse(course);
    
    const improvements = [];
    if (!course.syllabus || course.syllabus.length < 500) {
      improvements.push('Generated comprehensive syllabus');
    }
    if (!course.modules || course.modules.length < 3) {
      improvements.push('Created structured learning modules');
    }
    if (enhanced.modules.some(m => !m.items || m.items.length < 3)) {
      improvements.push('Enhanced module content and activities');
    }
    improvements.push('Added detailed assignments with rubrics');
    improvements.push('Included reading materials and discussions');

    return {
      syllabus: enhanced.syllabus || '',
      moduleCount: enhanced.modules.length,
      improvements
    };
  }
} 