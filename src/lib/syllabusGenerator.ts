import { Course } from './mockCanvasApi';

export interface SyllabusTemplate {
  courseOverview: string;
  learningObjectives: string[];
  assessmentBreakdown: Array<{
    type: string;
    percentage: number;
    description: string;
  }>;
  courseSchedule: string;
  requiredMaterials: string[];
  policies: {
    attendance: string;
    lateWork: string;
    academicIntegrity: string;
    accessibility: string;
  };
  weeklyTopics: Array<{
    week: number;
    topic: string;
    learningGoals: string[];
    activities: string[];
    assessments: string[];
  }>;
}

export class SyllabusGenerator {
  
  static generateSyllabus(course: Course): string {
    const template = this.getSyllabusTemplate(course);
    
    return `# ${course.name} (${course.course_code})
**Instructor:** ${course.instructor}
**Email:** ${course.instructor_email}  
**Term:** ${course.term}
**Credits:** ${course.credits}
**Meeting Times:** ${course.meeting_times}
**Location:** ${course.room_location || 'TBD'}

## Course Overview
${template.courseOverview}

## Learning Objectives
By the end of this course, students will be able to:
${template.learningObjectives.map(obj => `• ${obj}`).join('\n')}

## Assessment Breakdown
${template.assessmentBreakdown.map(assess => 
  `**${assess.type} (${assess.percentage}%):** ${assess.description}`
).join('\n')}

## Course Schedule
${template.courseSchedule}

## Required Materials
${template.requiredMaterials.map(material => `• ${material}`).join('\n')}

## Course Policies

### Attendance Policy
${template.policies.attendance}

### Late Work Policy  
${template.policies.lateWork}

### Academic Integrity
${template.policies.academicIntegrity}

### Accessibility Statement
${template.policies.accessibility}

## Weekly Course Schedule

${template.weeklyTopics.map(week => `
**Week ${week.week}: ${week.topic}**
- Learning Goals: ${week.learningGoals.join(', ')}
- Activities: ${week.activities.join(', ')}
- Assessments: ${week.assessments.join(', ')}
`).join('\n')}

---
*This syllabus is subject to change. Students will be notified of any modifications.*`;
  }

  static getSyllabusTemplate(course: Course): SyllabusTemplate {
    // Department-specific syllabi templates
    switch (course.department) {
      case 'Computer Science':
      case 'Computer Science & Engineering':
        return this.getCSTemplate(course);
      case 'Mathematics':
        return this.getMathTemplate(course);
      case 'English':
        return this.getEnglishTemplate(course);
      case 'TCLAS School of International Letters and Cultures':
        return this.getLanguageTemplate(course);
      default:
        return this.getGenericTemplate(course);
    }
  }

  static getCSTemplate(course: Course): SyllabusTemplate {
    const isAdvanced = parseInt(course.course_code.match(/\d+/)?.[0] || '0') >= 300;
    
    return {
      courseOverview: `This ${isAdvanced ? 'advanced' : 'foundational'} computer science course focuses on ${course.description}. Students will engage in hands-on programming projects, theoretical problem-solving, and collaborative software development practices that mirror industry standards.`,
      
      learningObjectives: [
        'Apply computational thinking to solve complex problems',
        'Implement efficient algorithms and data structures',
        'Write clean, well-documented, and maintainable code',
        'Use version control and collaborative development tools',
        'Understand software engineering best practices',
        'Debug and test software systematically',
        ...(isAdvanced ? [
          'Analyze algorithmic complexity and performance',
          'Design scalable software architectures',
          'Apply advanced programming patterns and paradigms'
        ] : [])
      ],
      
      assessmentBreakdown: [
        { type: 'Programming Assignments', percentage: 40, description: '6-8 coding projects increasing in complexity' },
        { type: 'Quizzes & Labs', percentage: 20, description: 'Weekly coding exercises and concept assessments' },
        { type: 'Midterm Project', percentage: 20, description: 'Comprehensive application demonstrating course concepts' },
        { type: 'Final Project', percentage: 20, description: 'Original software project with documentation and presentation' }
      ],
      
      courseSchedule: `Classes meet ${course.meeting_times}. Each session includes lecture, hands-on coding, and collaborative problem-solving.`,
      
      requiredMaterials: [
        'Laptop with development environment setup',
        'Course-specific IDE or text editor (instructions provided)',
        'GitHub account for version control',
        'Access to online coding platforms and resources'
      ],
      
      policies: {
        attendance: 'Regular attendance is essential due to hands-on nature of coursework. Missing more than 3 classes may result in course withdrawal recommendation.',
        lateWork: 'Programming assignments lose 10% per day late. Extensions granted for documented emergencies only.',
        academicIntegrity: 'Collaboration encouraged on learning, but all submitted code must be your own work. Plagiarism detection software used.',
        accessibility: 'Students with disabilities should contact Disability Resources Center. All course materials available in alternative formats upon request.'
      },
      
      weeklyTopics: this.generateCSWeeklyTopics(course)
    };
  }

  static getMathTemplate(course: Course): SyllabusTemplate {
    return {
      courseOverview: `This mathematics course provides rigorous treatment of ${course.description}. Emphasis on problem-solving, mathematical reasoning, and applications to real-world scenarios.`,
      
      learningObjectives: [
        'Master fundamental mathematical concepts and techniques',
        'Develop logical reasoning and proof-writing skills',
        'Apply mathematical methods to solve real-world problems',
        'Communicate mathematical ideas clearly and precisely',
        'Use technology appropriately as a mathematical tool'
      ],
      
      assessmentBreakdown: [
        { type: 'Homework', percentage: 15, description: 'Weekly problem sets reinforcing concepts' },
        { type: 'Quizzes', percentage: 20, description: 'Bi-weekly assessments of understanding' },
        { type: 'Midterm Exams', percentage: 45, description: '3 exams covering major course units' },
        { type: 'Final Exam', percentage: 20, description: 'Comprehensive cumulative assessment' }
      ],
      
      courseSchedule: `Classes meet ${course.meeting_times}. Each session includes lecture, worked examples, and group problem-solving.`,
      
      requiredMaterials: [
        'Scientific calculator (graphing calculator recommended)',
        'Course textbook and solution manual',
        'Graph paper and geometric tools',
        'Access to online homework system (WebAssign/MyMathLab)',
        'Supplementary practice materials (provided)'
      ],
      
      policies: {
        attendance: 'Attendance strongly recommended. Students responsible for all material covered in class.',
        lateWork: 'Late homework accepted within 24 hours for 50% credit. No late quizzes or exams without prior arrangement.',
        academicIntegrity: 'Collaboration encouraged on homework. Individual work required on quizzes and exams.',
        accessibility: 'Accommodations available through Disability Resources Center. Alternative testing arrangements provided as needed.'
      },
      
      weeklyTopics: this.generateMathWeeklyTopics(course)
    };
  }

  static getEnglishTemplate(course: Course): SyllabusTemplate {
    return {
      courseOverview: `This English course develops critical reading, analytical thinking, and effective writing skills through engagement with diverse literary texts. Students will explore ${course.description}`,
      
      learningObjectives: [
        'Analyze literary texts using various critical approaches',
        'Write clear, well-supported analytical essays',
        'Engage in thoughtful discussion about literature',
        'Develop close reading and interpretation skills',
        'Understand historical and cultural contexts of texts',
        'Appreciate diverse voices and perspectives in literature'
      ],
      
      assessmentBreakdown: [
        { type: 'Participation & Discussion', percentage: 20, description: 'Active engagement in class discussions and online forums' },
        { type: 'Literary Analysis Essays', percentage: 40, description: '4 formal essays demonstrating analytical skills' },
        { type: 'Midterm Exam', percentage: 20, description: 'Close reading and identification exercises' },
        { type: 'Final Project', percentage: 20, description: 'Research paper or creative response with presentation' }
      ],
      
      courseSchedule: `Classes meet ${course.meeting_times}. Format includes discussion, lecture, group work, and writing workshops.`,
      
      requiredMaterials: [
        'Course anthology and assigned novels',
        'MLA Handbook for citation format',
        'Access to library databases for research',
        'Notebook for reading responses and notes',
        'Reliable computer access for writing assignments'
      ],
      
      policies: {
        attendance: 'Participation grade depends on attendance. More than 2 unexcused absences may affect final grade.',
        lateWork: 'Papers accepted late with penalty: 5% per day. Extensions granted for documented emergencies.',
        academicIntegrity: 'Original analysis required. Proper citation essential. Plagiarism results in course failure.',
        accessibility: 'Alternative formats for readings available. Extended time for writing assignments when appropriate.'
      },
      
      weeklyTopics: this.generateEnglishWeeklyTopics(course)
    };
  }

  static getLanguageTemplate(course: Course): SyllabusTemplate {
    return {
      courseOverview: `This elementary Chinese course introduces students to modern Chinese language with emphasis on pronunciation, basic sentence patterns, and character recognition. Students develop fundamental speaking, listening, reading and writing skills through immersive cultural contexts.`,
      
      learningObjectives: [
        'Master basic Mandarin pronunciation using Pinyin system',
        'Recognize and write 200+ fundamental Chinese characters',
        'Engage in simple conversations about daily topics',
        'Understand basic grammatical structures and sentence patterns',
        'Demonstrate cultural awareness and sensitivity',
        'Use language learning strategies effectively'
      ],
      
      assessmentBreakdown: [
        { type: 'Participation & Homework', percentage: 20, description: 'Daily engagement and practice exercises' },
        { type: 'Character Quizzes', percentage: 20, description: 'Weekly character recognition and writing tests' },
        { type: 'Oral Assessments', percentage: 25, description: 'Speaking tests and pronunciation evaluations' },
        { type: 'Unit Tests', percentage: 25, description: 'Comprehensive tests covering listening, reading, writing' },
        { type: 'Cultural Project', percentage: 10, description: 'Research and presentation on Chinese culture' }
      ],
      
      courseSchedule: `Daily classes meet ${course.meeting_times}. Format includes conversation practice, character writing, cultural activities, and immersive exercises.`,
      
      requiredMaterials: [
        'Integrated Chinese Level 1 textbook and workbook',
        'Audio/video materials for pronunciation practice',
        'Character practice sheets and writing materials',
        'Access to online learning platforms (Pleco, HelloChinese)',
        'Cultural exploration journal'
      ],
      
      policies: {
        attendance: 'Daily attendance essential for language acquisition. Absence policy strictly enforced.',
        lateWork: 'Language skills build daily. Late assignments accepted within 24 hours for reduced credit.',
        academicIntegrity: 'Individual practice essential. Group study encouraged, but assessments must reflect personal ability.',
        accessibility: 'Visual, auditory, and kinesthetic learning accommodations available. Modified assessments when appropriate.'
      },
      
      weeklyTopics: this.generateLanguageWeeklyTopics(course)
    };
  }

  static getGenericTemplate(course: Course): SyllabusTemplate {
    return {
      courseOverview: course.description,
      learningObjectives: [
        'Demonstrate understanding of core course concepts',
        'Apply knowledge to practical situations',
        'Develop critical thinking and analytical skills',
        'Communicate ideas effectively',
        'Engage in collaborative learning experiences'
      ],
      assessmentBreakdown: [
        { type: 'Assignments', percentage: 30, description: 'Regular coursework and projects' },
        { type: 'Participation', percentage: 15, description: 'Class engagement and discussion' },
        { type: 'Midterm Exam', percentage: 25, description: 'Mid-semester assessment' },
        { type: 'Final Project/Exam', percentage: 30, description: 'Comprehensive final assessment' }
      ],
      courseSchedule: `Classes meet ${course.meeting_times}.`,
      requiredMaterials: ['Course materials as specified', 'Access to learning management system'],
      policies: {
        attendance: 'Regular attendance expected and may affect participation grade.',
        lateWork: 'Late work policy varies by assignment type. See individual assignment instructions.',
        academicIntegrity: 'Academic honesty expected. Original work required unless collaboration specified.',
        accessibility: 'Accommodations available through appropriate campus resources.'
      },
      weeklyTopics: []
    };
  }

  // Course-specific weekly topic generators
  static generateCSWeeklyTopics(course: Course): Array<any> {
    if (course.course_code.includes('380')) {
      return [
        { week: 1, topic: 'React Fundamentals Review', learningGoals: ['Master hooks and functional components', 'Understand component lifecycle'], activities: ['Hands-on coding', 'Component building exercises'], assessments: ['React hooks quiz'] },
        { week: 2, topic: 'Next.js App Router', learningGoals: ['Server vs client components', 'Routing and navigation'], activities: ['Build multi-page app', 'Routing lab'], assessments: ['Next.js project'] },
        { week: 3, topic: 'TypeScript Integration', learningGoals: ['Type safety in React', 'Advanced TypeScript patterns'], activities: ['Type definition exercises', 'Refactoring lab'], assessments: ['TypeScript quiz'] },
        { week: 4, topic: 'State Management', learningGoals: ['Context API mastery', 'Global state patterns'], activities: ['State management project', 'Redux alternatives'], assessments: ['State management assignment'] },
        { week: 5, topic: 'API Integration', learningGoals: ['RESTful API consumption', 'Error handling'], activities: ['API integration lab', 'Error boundary implementation'], assessments: ['API project'] }
      ];
    } else if (course.course_code.includes('205')) {
      return [
        { week: 1, topic: 'Object-Oriented Programming Review', learningGoals: ['Classes and objects', 'Inheritance principles'], activities: ['OOP coding exercises', 'Design pattern examples'], assessments: ['OOP fundamentals quiz'] },
        { week: 2, topic: 'Data Structures', learningGoals: ['Arrays, lists, stacks, queues', 'Implementation strategies'], activities: ['Data structure coding', 'Performance analysis'], assessments: ['Data structures project'] },
        { week: 3, topic: 'Algorithm Analysis', learningGoals: ['Big-O notation', 'Time complexity'], activities: ['Algorithm comparison', 'Complexity analysis'], assessments: ['Algorithm quiz'] }
      ];
    }
    return [
      { week: 1, topic: 'Course Introduction', learningGoals: ['Course overview', 'Tool setup'], activities: ['Environment setup', 'Initial coding'], assessments: ['Setup verification'] },
      { week: 2, topic: 'Fundamentals', learningGoals: ['Core concepts', 'Basic implementation'], activities: ['Practice exercises', 'Code review'], assessments: ['Fundamentals quiz'] },
      { week: 3, topic: 'Advanced Concepts', learningGoals: ['Complex topics', 'Real applications'], activities: ['Project work', 'Case studies'], assessments: ['Project milestone'] }
    ];
  }

  static generateMathWeeklyTopics(course: Course): Array<any> {
    if (course.course_code.includes('265')) {
      return [
        { week: 1, topic: 'Limits and Continuity', learningGoals: ['Evaluate limits graphically and algebraically', 'Determine continuity'], activities: ['Graphical analysis', 'Limit calculations'], assessments: ['Limits quiz'] },
        { week: 2, topic: 'Derivatives', learningGoals: ['Apply differentiation rules', 'Interpret derivatives geometrically'], activities: ['Derivative practice', 'Graph sketching'], assessments: ['Derivative rules test'] },
        { week: 3, topic: 'Applications of Derivatives', learningGoals: ['Solve optimization problems', 'Related rates'], activities: ['Real-world applications', 'Problem-solving workshops'], assessments: ['Applications quiz'] },
        { week: 4, topic: 'Integration Introduction', learningGoals: ['Fundamental Theorem of Calculus', 'Basic integration'], activities: ['Integration practice', 'Area calculations'], assessments: ['Integration quiz'] }
      ];
    }
    return [
      { week: 1, topic: 'Mathematical Foundations', learningGoals: ['Core concepts', 'Problem-solving'], activities: ['Problem sets', 'Group work'], assessments: ['Foundations quiz'] },
      { week: 2, topic: 'Advanced Topics', learningGoals: ['Complex concepts', 'Applications'], activities: ['Advanced problems', 'Real-world applications'], assessments: ['Midterm exam'] },
      { week: 3, topic: 'Integration and Review', learningGoals: ['Synthesis', 'Comprehensive understanding'], activities: ['Review sessions', 'Practice exams'], assessments: ['Final exam'] }
    ];
  }

  static generateEnglishWeeklyTopics(course: Course): Array<any> {
    if (course.course_code.includes('101')) {
      return [
        { week: 1, topic: 'Introduction to Literary Analysis', learningGoals: ['Close reading techniques', 'Literary devices identification'], activities: ['Text analysis practice', 'Discussion groups'], assessments: ['Reading response'] },
        { week: 2, topic: 'Poetry Analysis', learningGoals: ['Understand poetic forms', 'Analyze imagery and metaphor'], activities: ['Poetry workshop', 'Comparative analysis'], assessments: ['Poetry analysis essay'] },
        { week: 3, topic: 'Fiction Elements', learningGoals: ['Character and plot analysis', 'Narrative techniques'], activities: ['Short story discussions', 'Creative exercises'], assessments: ['Fiction analysis paper'] },
        { week: 4, topic: 'Research and Citation', learningGoals: ['Research skills', 'MLA format'], activities: ['Library workshop', 'Citation practice'], assessments: ['Research proposal'] }
      ];
    }
    return [
      { week: 1, topic: 'Reading and Analysis', learningGoals: ['Critical reading', 'Text interpretation'], activities: ['Reading discussions', 'Analysis practice'], assessments: ['Reading quiz'] },
      { week: 2, topic: 'Writing and Communication', learningGoals: ['Clear writing', 'Argument development'], activities: ['Writing workshops', 'Peer review'], assessments: ['Essay assignment'] },
      { week: 3, topic: 'Research and Presentation', learningGoals: ['Research skills', 'Presentation abilities'], activities: ['Research project', 'Presentations'], assessments: ['Final project'] }
    ];
  }

  static generateLanguageWeeklyTopics(course: Course): Array<any> {
    if (course.course_code.includes('101')) {
      return [
        { week: 1, topic: 'Pinyin and Pronunciation', learningGoals: ['Master four tones', 'Basic phonetics'], activities: ['Pronunciation drills', 'Listening exercises'], assessments: ['Pronunciation test'] },
        { week: 2, topic: 'Basic Greetings and Introductions', learningGoals: ['Self-introduction', 'Politeness formulas'], activities: ['Role-play conversations', 'Cultural context discussion'], assessments: ['Oral assessment'] },
        { week: 3, topic: 'Numbers and Time', learningGoals: ['Count to 100', 'Tell time'], activities: ['Number games', 'Schedule practice'], assessments: ['Numbers quiz'] },
        { week: 4, topic: 'Family and Relationships', learningGoals: ['Family vocabulary', 'Relationship terms'], activities: ['Family tree creation', 'Dialogue practice'], assessments: ['Family vocabulary test'] }
      ];
    }
    return [
      { week: 1, topic: 'Language Basics', learningGoals: ['Fundamental sounds', 'Basic vocabulary'], activities: ['Pronunciation practice', 'Vocabulary drills'], assessments: ['Basic quiz'] },
      { week: 2, topic: 'Communication', learningGoals: ['Simple conversations', 'Cultural context'], activities: ['Dialogue practice', 'Cultural activities'], assessments: ['Oral test'] },
      { week: 3, topic: 'Application', learningGoals: ['Real-world usage', 'Cultural understanding'], activities: ['Role-play scenarios', 'Cultural projects'], assessments: ['Final assessment'] }
    ];
  }
} 