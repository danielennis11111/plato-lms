// Test script to enhance all courses with comprehensive semester content
const { mockCanvasApi } = require('./lib/mockCanvasApi.ts');

async function enhanceAllCourses() {
  console.log('🚀 Starting comprehensive course enhancement...');
  
  try {
    const courses = await mockCanvasApi.getCourses();
    console.log(`📚 Found ${courses.length} courses to enhance`);
    
    for (const course of courses) {
      console.log(`🔄 Enhancing course: ${course.course_code} - ${course.name}`);
      
      // Generate 8 comprehensive modules for full semester
      const enhancedModules = generateSemesterModules(course);
      
      // Update course with new content
      course.modules = enhancedModules;
      course.start_date = '2025-01-13';
      course.end_date = '2025-05-02';
      course.term = 'Spring 2025';
      course.total_points = calculateTotalPoints(enhancedModules);
      
      console.log(`✅ Enhanced ${course.course_code} with ${enhancedModules.length} modules and ${course.total_points} total points`);
    }
    
    console.log('🎉 All courses enhanced successfully!');
    return { success: true, enhanced: courses.length };
    
  } catch (error) {
    console.error('❌ Enhancement failed:', error);
    return { success: false, error };
  }
}

function generateSemesterModules(course) {
  const modules = [];
  const startDate = new Date('2025-01-13');
  const moduleTopics = getModuleTopics(course.department, course.name);
  
  for (let i = 0; i < 8; i++) {
    const moduleStartWeek = i * 2; // 2 weeks per module
    const moduleDate = new Date(startDate);
    moduleDate.setDate(moduleDate.getDate() + (moduleStartWeek * 7));
    
    const module = {
      id: i + 1,
      name: `Module ${i + 1}: ${moduleTopics[i]?.title || 'Advanced Topics'}`,
      description: moduleTopics[i]?.overview || 'Comprehensive study of advanced concepts',
      items: generateModuleItems(i + 1, moduleTopics[i], course.department, moduleDate),
      due_date: new Date(moduleDate.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      is_completed: false
    };
    
    modules.push(module);
  }
  
  return modules;
}

function generateModuleItems(moduleNumber, topic, department, startDate) {
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
  
  // Reading 1 - Essential Materials
  const reading1Date = new Date(startDate);
  reading1Date.setDate(reading1Date.getDate() + 2);
  items.push({
    id: itemId++,
    title: `${topic?.title || 'Module'} - Essential Reading`,
    type: 'reading',
    content: `Read foundational materials covering ${topic?.title?.toLowerCase() || 'key concepts'}. Focus on core principles and theoretical foundations.`,
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
  
  // Discussion Forum
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
  
  // Reading 2 - Advanced Materials
  const reading2Date = new Date(startDate);
  reading2Date.setDate(reading2Date.getDate() + 7);
  items.push({
    id: itemId++,
    title: `${topic?.title || 'Module'} - Advanced Reading`,
    type: 'reading',
    content: `Advanced materials and case studies for ${topic?.title?.toLowerCase() || 'module concepts'}. Explore practical applications and current research.`,
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
  
  // Major Assignment
  const assignmentDate = new Date(startDate);
  assignmentDate.setDate(assignmentDate.getDate() + 10);
  items.push({
    id: itemId++,
    title: `${topic?.title || 'Module'} ${getAssignmentType(department, moduleNumber)}`,
    type: 'assignment',
    content: generateAssignmentContent(topic, department, moduleNumber),
    due_date: assignmentDate.toISOString().split('T')[0],
    status: 'not_started',
    points_possible: 100 + (moduleNumber * 5), // Progressive difficulty
    max_attempts: 3,
    submissions: 0,
    attempts: 0
  });
  
  // Module Assessment Quiz
  const quizDate = new Date(startDate);
  quizDate.setDate(quizDate.getDate() + 13);
  items.push({
    id: itemId++,
    title: `${topic?.title || 'Module'} Assessment`,
    type: 'quiz',
    content: `Comprehensive assessment covering key concepts from ${topic?.title?.toLowerCase() || 'module content'}. Tests understanding and application of learned material.`,
    due_date: quizDate.toISOString().split('T')[0],
    status: 'not_started',
    points_possible: 50,
    max_attempts: 2,
    attempts: 0
  });
  
  return items;
}

function getModuleTopics(department, courseName) {
  const courseSpecificTopics = {
    'Computer Science': {
      'Advanced Web Development': [
        { title: 'Modern React Fundamentals', overview: 'Master React hooks, context, and modern development patterns' },
        { title: 'State Management Systems', overview: 'Redux, Zustand, and advanced state management techniques' },
        { title: 'Backend Integration', overview: 'API design, authentication, and full-stack development' },
        { title: 'Performance Optimization', overview: 'Code splitting, lazy loading, and performance monitoring' },
        { title: 'Testing Strategies', overview: 'Unit testing, integration testing, and E2E testing' },
        { title: 'Deployment & DevOps', overview: 'CI/CD pipelines, containerization, and cloud deployment' },
        { title: 'Advanced Patterns', overview: 'Design patterns, architecture, and scalability' },
        { title: 'Capstone Project', overview: 'Comprehensive full-stack application development' }
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
  
  // Get course-specific topics or generic fallback
  const departmentCourses = courseSpecificTopics[department];
  if (departmentCourses && departmentCourses[courseName]) {
    return departmentCourses[courseName];
  }
  
  // Generic fallback topics for courses without specific content
  return [
    { title: 'Foundations', overview: 'Introduction to fundamental concepts and principles' },
    { title: 'Core Concepts', overview: 'Building upon fundamental knowledge with core concepts' },
    { title: 'Advanced Topics', overview: 'Exploring advanced topics and applications' },
    { title: 'Practical Applications', overview: 'Applying knowledge to real-world scenarios' },
    { title: 'Analysis and Synthesis', overview: 'Analyzing and synthesizing complex information' },
    { title: 'Contemporary Issues', overview: 'Examining current trends and developments' },
    { title: 'Research and Innovation', overview: 'Engaging in research and innovative thinking' },
    { title: 'Integration and Assessment', overview: 'Integrating knowledge and comprehensive assessment' }
  ];
}

function generateIntroContent(topic) {
  return `<div class="module-introduction">
    <h2>Welcome to ${topic?.title || 'This Module'}</h2>
    <p>${topic?.overview || 'In this module, you will explore important concepts and develop essential skills.'}</p>
    
    <h3>Learning Objectives</h3>
    <ul>
      <li>Understand the fundamental concepts of ${topic?.title?.toLowerCase() || 'the subject matter'}</li>
      <li>Apply theoretical knowledge to practical scenarios</li>
      <li>Develop critical thinking skills related to ${topic?.title?.toLowerCase() || 'this topic'}</li>
      <li>Engage with peers in meaningful discussions</li>
    </ul>
    
    <h3>Module Structure</h3>
    <p>This module spans two weeks and includes readings, discussions, assignments, and assessments designed to build your understanding progressively.</p>
    
    <div class="success-tips">
      <h4>Tips for Success</h4>
      <ul>
        <li>Start early and pace yourself throughout the module</li>
        <li>Engage actively in discussions with your classmates</li>
        <li>Don't hesitate to ask questions if concepts are unclear</li>
        <li>Take advantage of office hours and additional resources</li>
      </ul>
    </div>
  </div>`;
}

function generateDiscussionPrompt(topic, department) {
  const departmentPrompts = {
    'Computer Science': [
      'Best Practices', 'Technology Trends', 'Code Architecture', 'Problem Solving Approaches'
    ],
    'Mathematics': [
      'Mathematical Concepts', 'Real-world Applications', 'Problem Solving Strategies'
    ],
    'English': [
      'Literary Interpretation', 'Writing Techniques', 'Cultural Context'
    ],
    'Spanish': [
      'Cultural Exchange', 'Language Practice', 'Current Events'
    ],
    'French': [
      'French Culture', 'Language Learning', 'Literature Discussion'
    ]
  };
  
  const prompts = departmentPrompts[department] || departmentPrompts['Computer Science'];
  const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  
  return `Engage in a thoughtful discussion about ${topic?.title?.toLowerCase() || 'the module content'} with focus on ${selectedPrompt.toLowerCase()}.

**Discussion Guidelines:**
- **Initial Post:** 250+ words with specific examples and course material references
- **Peer Responses:** Reply to at least 2 classmates with substantive, constructive feedback
- **Academic Tone:** Maintain respectful, scholarly discourse throughout

**Prompting Questions:**
- How do these concepts apply to real-world scenarios?
- What connections can you make to previous learning?
- What questions or challenges do you encounter with this material?
- How might these ideas evolve in the future?

**Evaluation Criteria:**
- Depth of analysis and critical thinking
- Use of specific examples and evidence
- Quality of peer interactions
- Timeliness and professionalism`;
}

function getAssignmentType(department, moduleNumber) {
  const assignmentTypes = {
    'Computer Science': ['Programming Project', 'Code Review', 'System Design', 'Algorithm Implementation'],
    'Mathematics': ['Problem Set', 'Proof Assignment', 'Mathematical Modeling', 'Computational Exercise'],
    'English': ['Literary Analysis', 'Creative Writing', 'Research Paper', 'Critical Essay'],
    'Spanish': ['Oral Presentation', 'Written Composition', 'Cultural Project', 'Grammar Exercise'],
    'French': ['Oral Assessment', 'Written Assignment', 'Cultural Analysis', 'Language Exercise']
  };
  
  const types = assignmentTypes[department] || assignmentTypes['Computer Science'];
  return types[moduleNumber % types.length];
}

function generateAssignmentContent(topic, department, moduleNumber) {
  const assignmentType = getAssignmentType(department, moduleNumber);
  
  return `Complete this ${assignmentType.toLowerCase()} demonstrating your understanding of ${topic?.title?.toLowerCase() || 'module concepts'}.

**Assignment Requirements:**
- Demonstrate mastery of key concepts and terminology
- Apply theoretical knowledge to practical scenarios
- Follow proper academic formatting and citation standards
- Submit all required components by the due date

**Specific Deliverables:**
${department === 'Computer Science' ? 
  '- Well-commented source code with proper documentation\n- README file with setup and usage instructions\n- Test cases demonstrating functionality\n- Brief technical report explaining design decisions' :
  department === 'Mathematics' ?
  '- Complete solutions with all work shown\n- Clear explanations of problem-solving approaches\n- Verification of answers where applicable\n- Reflection on mathematical concepts learned' :
  '- Well-structured analysis with clear thesis\n- Evidence from course materials and additional sources\n- Proper citations in appropriate academic format\n- Thoughtful conclusion synthesizing key insights'
}

**Evaluation Criteria:**
- **Content Accuracy (40%):** Correct understanding and application of concepts
- **Critical Analysis (30%):** Depth of thinking and analytical skills
- **Presentation Quality (20%):** Organization, clarity, and professionalism
- **Requirements Adherence (10%):** Following instructions and meeting deadlines

**Academic Integrity:**
This assignment must represent your original work. Properly cite all sources and collaborate only as permitted by course policies.`;
}

function calculateTotalPoints(modules) {
  return modules.reduce((total, module) => {
    return total + module.items.reduce((moduleTotal, item) => {
      return moduleTotal + (item.points_possible || 0);
    }, 0);
  }, 0);
}

// Run the enhancement
enhanceAllCourses().then(result => {
  console.log('📊 Enhancement Result:', result);
}).catch(error => {
  console.error('💥 Enhancement Error:', error);
}); 