import { Course, Module } from './mockCanvasApi';
import { enhanceCourseContent } from './enhancedContentGenerator';

// Helper function to generate realistic dates relative to June 4, 2025
function getRelativeDate(daysFromToday: number): string {
  const TODAY = new Date('2025-06-04');
  const date = new Date(TODAY);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString();
}

// Music department configuration for Popular Music Class Piano
const musicDepartmentConfig = {
  modules: [
    { 
      name: 'Piano Fundamentals and Posture', 
      description: 'Basic piano technique, proper posture, hand position, and keyboard geography',
      advancedTopic: 'Advanced Hand Positioning Techniques'
    },
    { 
      name: 'Popular Music Theory Essentials', 
      description: 'Basic music theory including scales, chords, and progressions in popular music',
      advancedTopic: 'Jazz Harmony and Chord Extensions'
    },
    { 
      name: 'Rhythm and Popular Styles', 
      description: 'Understanding rhythm patterns, time signatures, and style characteristics',
      advancedTopic: 'Complex Rhythmic Patterns and Syncopation'
    },
    { 
      name: 'Lead Sheets and Chord Charts', 
      description: 'Reading and interpreting lead sheets, chord symbols, and popular music notation',
      advancedTopic: 'Professional Lead Sheet Interpretation'
    },
    { 
      name: 'Popular Piano Styles', 
      description: 'Rock, pop, blues, and contemporary piano playing techniques',
      advancedTopic: 'Genre-Specific Stylistic Elements'
    },
    { 
      name: 'Jazz Piano Fundamentals', 
      description: 'Introduction to jazz piano including basic voicings and improvisation',
      advancedTopic: 'Advanced Jazz Voicings and Comping'
    },
    { 
      name: 'Performance and Expression', 
      description: 'Developing musical expression, dynamics, and performance confidence',
      advancedTopic: 'Professional Performance Techniques'
    },
    { 
      name: 'Final Portfolio and Recital', 
      description: 'Preparation and performance of a varied repertoire showcasing learned skills',
      advancedTopic: 'Advanced Repertoire and Interpretation'
    }
  ],
  readingTypes: ['The Complete Piano Player Series', 'Jazz Piano Studies'],
  assignmentTypes: ['Practice Recording', 'Performance Piece', 'Theory Exercise', 'Style Study'],
  discussionTopics: [
    'Musical Style Analysis', 
    'Performance Technique', 
    'Practice Methods', 
    'Musical Expression', 
    'Genre Characteristics', 
    'Professional Development', 
    'Music Theory Application', 
    'Career Insights'
  ]
};

function generateRelativeDate(daysFromToday: number): string {
  const TODAY = new Date('2025-06-04');
  const date = new Date(TODAY);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString();
}

export function generatePopularMusicPianoCourse(): Course {
  const baseDate = -85; // Starting 85 days ago for first module
  const moduleDuration = 14; // 2 weeks per module
  
  const modules: Module[] = [];
  
  for (let moduleIndex = 0; moduleIndex < 8; moduleIndex++) {
    const moduleNumber = moduleIndex + 1;
    const startDate = baseDate + (moduleIndex * moduleDuration);
    const moduleConfig = musicDepartmentConfig.modules[moduleIndex];
    
    const module: Module = {
      id: moduleNumber,
      name: `Module ${moduleNumber}: ${moduleConfig.name}`,
      description: moduleConfig.description,
      is_completed: moduleIndex < 3, // First 3 modules completed
      due_date: generateRelativeDate(startDate),
      items: []
    };

    let itemId = (moduleNumber * 100) + 1;

    // Introduction page
    module.items.push({
      id: itemId++,
      title: `Introduction to ${moduleConfig.name}`,
      type: 'page',
      content: `<h2>Welcome to ${moduleConfig.name}</h2><p>${moduleConfig.description}</p><h3>Learning Objectives</h3><ul><li>Develop technical piano skills</li><li>Understand musical concepts</li><li>Apply popular music styles</li><li>Build performance confidence</li></ul><h3>Required Materials</h3><ul><li>Digital piano or acoustic piano</li><li>Sheet music and lead sheets</li><li>Recording device for practice submissions</li></ul>`,
      due_date: generateRelativeDate(startDate),
      status: moduleIndex < 3 ? 'graded' : 'not_started',
      points_possible: 0
    });

    // Essential Reading
    module.items.push({
      id: itemId++,
      title: `${moduleConfig.name} - Essential Reading`,
      type: 'reading',
      content: `Read foundational materials covering ${moduleConfig.name.toLowerCase()}`,
      due_date: generateRelativeDate(startDate + 2),
      status: moduleIndex < 3 ? 'graded' : (moduleIndex === 3 ? 'graded' : 'not_started'),
      points_possible: 0,
      reading_details: {
        source: musicDepartmentConfig.readingTypes[0],
        pages: `${25 + (moduleIndex * 15)}-${40 + (moduleIndex * 15)}`,
        estimated_time: 45,
        type: 'textbook'
      }
    });

    // Discussion
    module.items.push({
      id: itemId++,
      title: `Discussion: ${musicDepartmentConfig.discussionTopics[moduleIndex]}`,
      type: 'discussion',
      content: `Discuss ${moduleConfig.name.toLowerCase()} and share your musical insights. Requirements: Initial post: 200+ words with musical examples, Respond to 2 classmates substantively, Reference course materials and personal practice experience`,
      due_date: generateRelativeDate(startDate + 4),
      status: moduleIndex < 3 ? 'graded' : (moduleIndex === 3 ? 'submitted' : 'not_started'),
      points_possible: 25
    });

    // Advanced Reading
    module.items.push({
      id: itemId++,
      title: `${moduleConfig.advancedTopic} - Advanced Reading`,
      type: 'reading',
      content: `Advanced materials for ${moduleConfig.name.toLowerCase()}`,
      due_date: generateRelativeDate(startDate + 7),
      status: moduleIndex < 3 ? 'graded' : (moduleIndex === 3 ? 'in_progress' : 'not_started'),
      points_possible: 0,
      reading_details: {
        source: musicDepartmentConfig.readingTypes[1],
        pages: `${40 + (moduleIndex * 15)}-${55 + (moduleIndex * 15)}`,
        estimated_time: 45,
        type: 'article'
      }
    });

    // Major Assignment (varies by module)
    const assignmentType = musicDepartmentConfig.assignmentTypes[moduleIndex % musicDepartmentConfig.assignmentTypes.length];
    module.items.push({
      id: itemId++,
      title: `${moduleConfig.name} ${assignmentType}`,
      type: 'assignment',
      content: `Complete this ${assignmentType.toLowerCase()} demonstrating understanding of ${moduleConfig.name.toLowerCase()}. Requirements: Apply course concepts correctly, Demonstrate proper technique, Submit video/audio recording, Follow performance standards`,
      due_date: generateRelativeDate(startDate + 10),
      status: moduleIndex < 3 ? 'graded' : 'not_started',
      grade: moduleIndex < 3 ? Math.floor(Math.random() * 15) + 82 : undefined,
      points_possible: 80 + (moduleIndex * 5),
      max_attempts: 3,
      submissions: moduleIndex < 3 ? 1 : 0,
      attempts: moduleIndex < 3 ? 1 : 0
    });

    // Assessment Quiz
    module.items.push({
      id: itemId++,
      title: `${moduleConfig.name} Assessment`,
      type: 'quiz',
      content: `Comprehensive assessment covering ${moduleConfig.name.toLowerCase()} theory and practical application`,
      due_date: generateRelativeDate(startDate + 13),
      status: moduleIndex < 3 ? 'graded' : 'not_started',
      grade: moduleIndex < 3 ? Math.floor(Math.random() * 15) + 80 : undefined,
      points_possible: 50,
      max_attempts: 2,
      attempts: moduleIndex < 3 ? 1 : 0
    });

    modules.push(module);
  }

  const baseCourse: Course = {
    id: 15,
    name: 'Popular Music Class Piano',
    course_code: 'MSC 131',
    description: 'An introduction to piano playing through popular music styles including rock, pop, blues, and jazz. Students will develop fundamental piano technique while learning to play contemporary music using lead sheets and chord charts.',
    instructor: 'Beth Lederman',
    instructor_email: 'blederma@asu.edu',
    term: 'Summer 2025',
    total_points: 1300,
    current_grade: 87,
    start_date: generateRelativeDate(-23),
    end_date: generateRelativeDate(72),
    department: 'HIDA School of Music, Dance and Theatre',
    credits: 2,
    prerequisites: [],
    room_location: 'MUSIC 150 - Piano Lab',
    meeting_times: 'TR 11:00-11:50 AM',
    syllabus: `Course Description:
MSC 131 Popular Music Class Piano introduces students to piano playing through contemporary music styles. This hands-on course develops fundamental piano technique while focusing on popular music genres including rock, pop, blues, and jazz. Students will learn to read lead sheets, play chord progressions, and develop basic improvisation skills.

Instructor: Beth Lederman brings 40 years of professional music industry experience to the classroom. With expertise in jazz piano and a Bachelor of Arts in Music from ASU, she provides real-world insights into popular music performance and technique.

Learning Objectives:
• Develop proper piano technique and posture
• Understand fundamental music theory as applied to popular music
• Read and interpret lead sheets and chord charts
• Play in various popular music styles (rock, pop, blues, jazz)
• Develop basic improvisation and accompaniment skills
• Build confidence in musical performance and expression

Course Structure:
Each module focuses on specific technical and stylistic elements:
- Weeks 1-2: Piano fundamentals and proper technique
- Weeks 3-4: Music theory essentials for popular music
- Weeks 5-6: Rhythm patterns and style characteristics
- Weeks 7-8: Lead sheet reading and chord interpretation
- Weeks 9-10: Popular piano styles (rock, pop, blues)
- Weeks 11-12: Jazz piano fundamentals and improvisation
- Weeks 13-14: Performance skills and musical expression
- Weeks 15-16: Final portfolio and student recital

Assessment:
• Practice Recordings (30%): Weekly video submissions showing technique progress
• Performance Pieces (25%): Live or recorded performances of assigned pieces
• Theory Exercises (20%): Written and practical music theory applications
• Class Participation (15%): Active engagement in class activities and discussions
• Final Recital (10%): Performance of chosen pieces demonstrating course skills

Required Materials:
• Access to piano or digital keyboard (88 keys preferred)
• "The Complete Piano Player" series (Books 1-2)
• "Jazz Piano Studies" supplementary materials
• Recording device for practice submissions
• Music notation app or software (recommendations provided)

Technology Integration:
• Canvas for assignments and resources
• Video submission platform for practice recordings
• Digital piano labs with recording capabilities
• Music theory software for interactive learning

Prerequisites: None - course designed for beginners and those with limited piano experience.

Note: Students are expected to practice minimum 5 hours per week outside of class. Piano lab access available for students without home instruments.`,
    modules
  };
  
  // Apply enhanced content with quizzes, readings, and YouTube videos
  return enhanceCourseContent(baseCourse);
} 