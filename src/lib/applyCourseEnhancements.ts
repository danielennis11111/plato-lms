import { mockCanvasApi } from './mockCanvasApi';

export async function enhanceAllCourses() {
  console.log('🚀 Starting comprehensive course enhancement...');
  
  try {
    const courses = await mockCanvasApi.getCourses();
    console.log(`📚 Found ${courses.length} courses to enhance`);
    
    for (const course of courses) {
      console.log(`🔄 Enhancing course: ${course.course_code} - ${course.name}`);
      
      const enhancedModules = generateSemesterModules(course);
      
      course.modules = enhancedModules;
      course.start_date = '2025-01-13';
      course.end_date = '2025-05-02';
      course.term = 'Spring 2025';
      course.total_points = calculateTotalPoints(enhancedModules);
      
      console.log(`✅ Enhanced ${course.course_code} with ${enhancedModules.length} modules`);
    }
    
    console.log('🎉 All courses enhanced successfully!');
    return { success: true, enhanced: courses.length };
    
  } catch (error) {
    console.error('❌ Enhancement failed:', error);
    return { success: false, error };
  }
}

function generateSemesterModules(course: any) {
  const modules = [];
  const startDate = new Date('2025-01-13');
  const moduleTopics = getModuleTopics(course.department, course.name);
  
  for (let i = 0; i < 8; i++) {
    const moduleStartWeek = i * 2;
    const moduleDate = new Date(startDate);
    moduleDate.setDate(moduleDate.getDate() + (moduleStartWeek * 7));
    
    const module = {
      id: i + 1,
      name: `Module ${i + 1}: ${moduleTopics[i]?.title || 'Advanced Topics'}`,
      description: moduleTopics[i]?.overview || 'Comprehensive study of course concepts',
      items: generateModuleItems(i + 1, moduleTopics[i], course.department, moduleDate),
      due_date: new Date(moduleDate.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      is_completed: false
    };
    
    modules.push(module);
  }
  
  return modules;
}

function generateModuleItems(moduleNumber: number, topic: any, department: string, startDate: Date) {
  const items = [];
  let itemId = moduleNumber * 100;
  
  // Introduction Page
  items.push({
    id: itemId++,
    title: `Introduction to ${topic?.title || 'Module Concepts'}`,
    type: 'page',
    content: generateIntroContent(topic),
    due_date: startDate.toISOString().split('T')[0],
    status: 'not_started',
    points_possible: 0
  });
  
  // Reading 1
  const reading1Date = new Date(startDate);
  reading1Date.setDate(reading1Date.getDate() + 2);
  items.push({
    id: itemId++,
    title: `${topic?.title || 'Module'} - Essential Reading`,
    type: 'reading',
    content: `Read foundational materials covering ${topic?.title?.toLowerCase() || 'key concepts'}`,
    due_date: reading1Date.toISOString().split('T')[0],
    status: 'not_started',
    points_possible: 0,
    reading_details: {
      source: 'Course Textbook',
      pages: `${45 + moduleNumber * 20}-${65 + moduleNumber * 20}`,
      estimated_time: 60,
      type: 'textbook'
    }
  });
  
  // Discussion
  const discussionDate = new Date(startDate);
  discussionDate.setDate(discussionDate.getDate() + 4);
  items.push({
    id: itemId++,
    title: `Discussion: ${topic?.title || 'Module Topics'}`,
    type: 'discussion',
    content: generateDiscussionPrompt(topic, department),
    due_date: discussionDate.toISOString().split('T')[0],
    status: 'not_started',
    points_possible: 25
  });
  
  // Reading 2
  const reading2Date = new Date(startDate);
  reading2Date.setDate(reading2Date.getDate() + 7);
  items.push({
    id: itemId++,
    title: `${topic?.title || 'Module'} - Advanced Reading`,
    type: 'reading',
    content: `Advanced materials for ${topic?.title?.toLowerCase() || 'module concepts'}`,
    due_date: reading2Date.toISOString().split('T')[0],
    status: 'not_started',
    points_possible: 0,
    reading_details: {
      source: 'Supplementary Materials',
      pages: `${65 + moduleNumber * 20}-${85 + moduleNumber * 20}`,
      estimated_time: 45,
      type: 'article'
    }
  });
  
  // Assignment
  const assignmentDate = new Date(startDate);
  assignmentDate.setDate(assignmentDate.getDate() + 10);
  items.push({
    id: itemId++,
    title: `${topic?.title || 'Module'} ${getAssignmentType(department, moduleNumber)}`,
    type: 'assignment',
    content: generateAssignmentContent(topic, department),
    due_date: assignmentDate.toISOString().split('T')[0],
    status: 'not_started',
    points_possible: 100 + (moduleNumber * 5),
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
    content: `Quiz covering ${topic?.title?.toLowerCase() || 'module content'}`,
    due_date: quizDate.toISOString().split('T')[0],
    status: 'not_started',
    points_possible: 50,
    max_attempts: 2,
    attempts: 0
  });
  
  return items;
}

function getModuleTopics(department: string, courseName: string) {
  const courseTopics: any = {
    'Computer Science': {
      'Advanced Web Development': [
        { title: 'React Fundamentals', overview: 'Modern React patterns and hooks' },
        { title: 'State Management', overview: 'Redux and advanced state handling' },
        { title: 'Backend Integration', overview: 'APIs and full-stack development' },
        { title: 'Performance', overview: 'Optimization and monitoring' },
        { title: 'Testing', overview: 'Testing strategies and implementation' },
        { title: 'Deployment', overview: 'CI/CD and cloud deployment' },
        { title: 'Architecture', overview: 'Design patterns and scalability' },
        { title: 'Capstone', overview: 'Final project development' }
      ]
    },
    'Mathematics': {
      'Calculus I': [
        { title: 'Limits', overview: 'Limits and continuity concepts' },
        { title: 'Derivatives', overview: 'Differentiation rules and techniques' },
        { title: 'Applications', overview: 'Optimization and related rates' },
        { title: 'Integration', overview: 'Antiderivatives and definite integrals' },
        { title: 'Techniques', overview: 'Advanced integration methods' },
        { title: 'Applications', overview: 'Area and volume calculations' },
        { title: 'Equations', overview: 'Differential equations basics' },
        { title: 'Series', overview: 'Infinite series and tests' }
      ]
    }
  };
  
  const departmentCourses = courseTopics[department];
  if (departmentCourses && departmentCourses[courseName]) {
    return departmentCourses[courseName];
  }
  
  return [
    { title: 'Foundations', overview: 'Fundamental concepts' },
    { title: 'Core Concepts', overview: 'Essential knowledge' },
    { title: 'Applications', overview: 'Practical applications' },
    { title: 'Analysis', overview: 'Critical analysis' },
    { title: 'Synthesis', overview: 'Knowledge integration' },
    { title: 'Research', overview: 'Research methods' },
    { title: 'Innovation', overview: 'Creative solutions' },
    { title: 'Mastery', overview: 'Advanced mastery' }
  ];
}

function generateIntroContent(topic: any) {
  return `<h2>Welcome to ${topic?.title || 'This Module'}</h2>
<p>${topic?.overview || 'This module covers essential concepts and skills.'}</p>

<h3>Learning Objectives</h3>
<ul>
<li>Master fundamental concepts</li>
<li>Apply knowledge practically</li>
<li>Develop critical thinking</li>
<li>Engage in collaborative learning</li>
</ul>`;
}

function generateDiscussionPrompt(topic: any, department: string) {
  return `Discuss ${topic?.title?.toLowerCase() || 'module concepts'} and share your insights.

Requirements:
- Initial post: 250+ words with examples
- Respond to 2 classmates substantively
- Reference course materials`;
}

function getAssignmentType(department: string, moduleNumber: number) {
  const types: any = {
    'Computer Science': ['Programming Project', 'Code Review', 'System Design'],
    'Mathematics': ['Problem Set', 'Proof Assignment', 'Modeling Exercise'],
    'English': ['Literary Analysis', 'Creative Writing', 'Research Paper']
  };
  
  const departmentTypes = types[department] || types['Computer Science'];
  return departmentTypes[moduleNumber % departmentTypes.length];
}

function generateAssignmentContent(topic: any, department: string) {
  return `Complete this assignment demonstrating understanding of ${topic?.title?.toLowerCase() || 'module concepts'}.

Requirements:
- Apply course concepts correctly
- Show detailed work and analysis
- Follow academic standards
- Submit by due date`;
}

function calculateTotalPoints(modules: any[]) {
  return modules.reduce((total: number, module: any) => {
    return total + module.items.reduce((moduleTotal: number, item: any) => {
      return moduleTotal + (item.points_possible || 0);
    }, 0);
  }, 0);
} 