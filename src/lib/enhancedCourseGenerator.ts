import { Course, ModuleItem } from '@/types/canvas';

// Enhanced content interfaces
export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correct_answer: string | boolean;
  explanation: string;
  points: number;
}

export interface EnhancedQuiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  total_points: number;
  time_limit_minutes?: number;
  attempts_allowed: number;
}

export interface Reading {
  id: string;
  title: string;
  content: string;
  key_points: string[];
  youtube_videos?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  further_reading?: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  estimated_time_minutes: number;
}

// Enhanced module item interface
export interface EnhancedModuleItem extends ModuleItem {
  quiz_details?: EnhancedQuiz;
  reading_details?: Reading;
}

// Course evaluation system
export interface CourseEvaluation {
  course_id: string;
  course_name: string;
  has_full_syllabus: boolean;
  content_richness_score: number; // 0-100
  needs_enhancement: boolean;
  enhancement_priority: 'high' | 'medium' | 'low';
  missing_elements: string[];
  enhancement_recommendations: string[];
}

export class EnhancedCourseGenerator {
  
  static evaluateAllCourses(courses: Course[]): CourseEvaluation[] {
    return courses.map(course => this.evaluateCourse(course));
  }

  static evaluateCourse(course: Course): CourseEvaluation {
    const evaluation: CourseEvaluation = {
      course_id: course.id.toString(),
      course_name: course.name,
      has_full_syllabus: false,
      content_richness_score: 0,
      needs_enhancement: false,
      enhancement_priority: 'medium',
      missing_elements: [],
      enhancement_recommendations: []
    };

    // Check for basic course structure
    const hasModules = course.modules && course.modules.length > 0;
    const moduleCount = course.modules?.length || 0;
    
    if (!hasModules) {
      evaluation.missing_elements.push('Course modules');
      evaluation.enhancement_recommendations.push('Create comprehensive module structure');
    }

    // Evaluate content depth
    let totalItems = 0;
    let enhancedItems = 0;
    let hasQuizzes = false;
    let hasReadings = false;
    let hasAssignments = false;
    let hasDiscussions = false;

    course.modules?.forEach(module => {
      module.items?.forEach(item => {
        totalItems++;
        
        // Check for enhanced content
        if ((item as EnhancedModuleItem).quiz_details) {
          enhancedItems++;
          hasQuizzes = true;
        }
        if ((item as EnhancedModuleItem).reading_details) {
          enhancedItems++;
          hasReadings = true;
        }
        
        // Check basic item types
        switch (item.type) {
          case 'quiz':
            hasQuizzes = true;
            break;
          case 'assignment':
            hasAssignments = true;
            break;
          case 'discussion':
            hasDiscussions = true;
            break;
        }
      });
    });

    // Calculate content richness score
    let score = 0;
    
    // Module structure (20 points)
    if (moduleCount >= 6) score += 20;
    else if (moduleCount >= 4) score += 15;
    else if (moduleCount >= 2) score += 10;
    
    // Content variety (40 points)
    if (hasQuizzes) score += 10;
    if (hasReadings) score += 10;
    if (hasAssignments) score += 10;
    if (hasDiscussions) score += 10;
    
    // Enhanced content ratio (40 points)
    if (totalItems > 0) {
      const enhancementRatio = enhancedItems / totalItems;
      score += Math.round(enhancementRatio * 40);
    }

    evaluation.content_richness_score = score;
    evaluation.has_full_syllabus = score >= 60;
    evaluation.needs_enhancement = score < 80;

    // Determine priority
    if (score < 40) {
      evaluation.enhancement_priority = 'high';
    } else if (score < 70) {
      evaluation.enhancement_priority = 'medium';
    } else {
      evaluation.enhancement_priority = 'low';
    }

    // Add specific missing elements and recommendations
    if (!hasQuizzes) {
      evaluation.missing_elements.push('Interactive quizzes');
      evaluation.enhancement_recommendations.push('Add knowledge assessment quizzes');
    }
    
    if (!hasReadings) {
      evaluation.missing_elements.push('Rich reading materials');
      evaluation.enhancement_recommendations.push('Create comprehensive readings');
    }
    
    if (!hasAssignments) {
      evaluation.missing_elements.push('Practical assignments');
      evaluation.enhancement_recommendations.push('Design hands-on assignments');
    }
    
    if (!hasDiscussions) {
      evaluation.missing_elements.push('Discussion forums');
      evaluation.enhancement_recommendations.push('Add collaborative discussions');
    }

    if (moduleCount < 6) {
      evaluation.missing_elements.push('Comprehensive module structure');
      evaluation.enhancement_recommendations.push('Expand to 6-8 modules');
    }

    return evaluation;
  }

  static generateEnhancedContent(course: Course, subject: string): {
    quizzes: EnhancedQuiz[];
    readings: Reading[];
  } {
    switch (subject.toLowerCase()) {
      case 'computer science':
        return this.generateCSContent(course);
      case 'environmental science':
        return this.generateEnvironmentalContent(course);
      case 'mathematics':
        return this.generateMathContent(course);
      default:
        return this.generateGenericContent(course);
    }
  }

  private static generateCSContent(course: Course): { quizzes: EnhancedQuiz[]; readings: Reading[] } {
    const quizzes: EnhancedQuiz[] = [
      {
        id: `${course.id}_cs_quiz`,
        title: 'Programming Fundamentals',
        description: 'Test core programming concepts',
        total_points: 100,
        attempts_allowed: 2,
        questions: [
          {
            id: '1',
            type: 'multiple_choice',
            question: 'What is abstraction in computer science?',
            options: [
              'Hiding implementation details',
              'Using abstract art',
              'Writing theoretical code',
              'Creating models'
            ],
            correct_answer: 'Hiding implementation details',
            explanation: 'Abstraction hides complexity behind simple interfaces.',
            points: 25
          }
        ]
      }
    ];

    const readings: Reading[] = [
      {
        id: `${course.id}_cs_reading`,
        title: 'Computer Science Foundations',
        content: 'Computer science fundamentals including algorithms and data structures...',
        key_points: [
          'Computational thinking involves problem decomposition',
          'Data structures organize information efficiently',
          'Algorithms provide step-by-step solutions'
        ],
        youtube_videos: [
          {
            id: 'YoXxevp1WRQ',
            title: 'Computational Thinking',
            description: 'Introduction to computational thinking concepts'
          }
        ],
        estimated_time_minutes: 25
      }
    ];

    return { quizzes, readings };
  }

  private static generateEnvironmentalContent(course: Course): { quizzes: EnhancedQuiz[]; readings: Reading[] } {
    const quizzes: EnhancedQuiz[] = [
      {
        id: `${course.id}_env_quiz`,
        title: 'Environmental Systems',
        description: 'Earth systems and processes assessment',
        total_points: 75,
        attempts_allowed: 2,
        questions: [
          {
            id: '1',
            type: 'multiple_choice',
            question: 'What drives water movement from surface to atmosphere?',
            options: ['Condensation', 'Precipitation', 'Evaporation', 'Infiltration'],
            correct_answer: 'Evaporation',
            explanation: 'Evaporation moves water from surface to atmosphere.',
            points: 25
          }
        ]
      }
    ];

    const readings: Reading[] = [
      {
        id: `${course.id}_env_reading`,
        title: 'Water Planet Systems',
        content: 'Understanding Earth\'s hydrological systems and processes...',
        key_points: [
          'Water cycle drives Earth processes',
          'Hillslope topography affects erosion',
          'Local processes connect to regional patterns'
        ],
        youtube_videos: [
          {
            id: 'al-do-HGuIk',
            title: 'Water Cycle Explained',
            description: 'How water moves through Earth systems'
          }
        ],
        estimated_time_minutes: 30
      }
    ];

    return { quizzes, readings };
  }

  private static generateMathContent(course: Course): { quizzes: EnhancedQuiz[]; readings: Reading[] } {
    return this.generateGenericContent(course);
  }

  private static generateGenericContent(course: Course): { quizzes: EnhancedQuiz[]; readings: Reading[] } {
    const quizzes: EnhancedQuiz[] = [
      {
        id: `${course.id}_general_quiz`,
        title: 'Course Foundations',
        description: 'Key concepts assessment',
        total_points: 50,
        attempts_allowed: 2,
        questions: [
          {
            id: '1',
            type: 'short_answer',
            question: 'Describe the main learning objectives for this course.',
            correct_answer: 'Student should demonstrate understanding of objectives.',
            explanation: 'This connects course content with academic goals.',
            points: 25
          }
        ]
      }
    ];

    const readings: Reading[] = [
      {
        id: `${course.id}_intro_reading`,
        title: 'Course Overview',
        content: 'Welcome to this comprehensive course...',
        key_points: [
          'Course emphasizes critical thinking',
          'Active learning through discussions',
          'Progressive module structure'
        ],
        estimated_time_minutes: 15
      }
    ];

    return { quizzes, readings };
  }

  static generateEvaluationReport(evaluations: CourseEvaluation[]): string {
    const highPriority = evaluations.filter(e => e.enhancement_priority === 'high');
    const avgScore = evaluations.reduce((sum, e) => sum + e.content_richness_score, 0) / evaluations.length;
    
    return `# Course Enhancement Report
    
Total Courses: ${evaluations.length}
Average Score: ${avgScore.toFixed(1)}/100
High Priority: ${highPriority.length} courses

High Priority Courses:
${highPriority.map(e => `- ${e.course_name} (${e.content_richness_score}/100)`).join('\n')}
    `;
  }
} 