const fs = require('fs');
const path = require('path');

// Comprehensive course generator function
function generateComprehensiveCourse(courseData, departmentConfig) {
  const baseDate = -85; // Starting 85 days ago for first module
  const moduleDuration = 14; // 2 weeks per module
  
  const modules = [];
  
  for (let moduleIndex = 0; moduleIndex < 8; moduleIndex++) {
    const moduleNumber = moduleIndex + 1;
    const startDate = baseDate + (moduleIndex * moduleDuration);
    const moduleConfig = departmentConfig.modules[moduleIndex];
    
    const module = {
      id: moduleNumber,
      name: `Module ${moduleNumber}: ${moduleConfig.name}`,
      description: moduleConfig.description,
      is_completed: moduleIndex < 3, // First 3 modules completed
      due_date: `getRelativeDate(${startDate})`,
      items: []
    };

    let itemId = (moduleNumber * 100) + 1;

    // Introduction page
    module.items.push({
      id: itemId++,
      title: `Introduction to ${moduleConfig.name}`,
      type: 'page',
      content: `<h2>Welcome to ${moduleConfig.name}</h2><p>${moduleConfig.description}</p><h3>Learning Objectives</h3><ul><li>Master fundamental concepts</li><li>Apply knowledge practically</li><li>Develop critical thinking</li><li>Engage in collaborative learning</li></ul>`,
      due_date: `getRelativeDate(${startDate})`,
      status: moduleIndex < 3 ? 'graded' : 'not_started',
      points_possible: 0
    });

    // Essential Reading
    module.items.push({
      id: itemId++,
      title: `${moduleConfig.name} - Essential Reading`,
      type: 'reading',
      content: `Read foundational materials covering ${moduleConfig.name.toLowerCase()}`,
      due_date: `getRelativeDate(${startDate + 2})`,
      status: moduleIndex < 3 ? 'graded' : (moduleIndex === 3 ? 'graded' : 'not_started'),
      points_possible: 0,
      reading_details: {
        source: departmentConfig.readingTypes[0],
        pages: `${25 + (moduleIndex * 20)}-${45 + (moduleIndex * 20)}`,
        estimated_time: 60,
        type: 'textbook'
      }
    });

    // Discussion
    module.items.push({
      id: itemId++,
      title: `Discussion: ${departmentConfig.discussionTopics[moduleIndex % departmentConfig.discussionTopics.length]}`,
      type: 'discussion',
      content: `Discuss ${moduleConfig.name.toLowerCase()} and share your insights. Requirements: Initial post: 250+ words with examples, Respond to 2 classmates substantively, Reference course materials`,
      due_date: `getRelativeDate(${startDate + 4})`,
      status: moduleIndex < 3 ? 'graded' : (moduleIndex === 3 ? 'submitted' : 'not_started'),
      points_possible: 25
    });

    // Advanced Reading
    module.items.push({
      id: itemId++,
      title: `${moduleConfig.advancedTopic} - Advanced Reading`,
      type: 'reading',
      content: `Advanced materials for ${moduleConfig.name.toLowerCase()}`,
      due_date: `getRelativeDate(${startDate + 7})`,
      status: moduleIndex < 3 ? 'graded' : (moduleIndex === 3 ? 'in_progress' : 'not_started'),
      points_possible: 0,
      reading_details: {
        source: departmentConfig.readingTypes[1],
        pages: `${45 + (moduleIndex * 20)}-${65 + (moduleIndex * 20)}`,
        estimated_time: 45,
        type: 'article'
      }
    });

    // Major Assignment
    const assignmentType = departmentConfig.assignmentTypes[moduleIndex % departmentConfig.assignmentTypes.length];
    module.items.push({
      id: itemId++,
      title: `${moduleConfig.name} ${assignmentType}`,
      type: 'assignment',
      content: `Complete this ${assignmentType.toLowerCase()} demonstrating understanding of ${moduleConfig.name.toLowerCase()}. Requirements: Apply course concepts correctly, Show detailed work and analysis, Follow academic standards, Submit by due date`,
      due_date: `getRelativeDate(${startDate + 10})`,
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
      content: `Comprehensive assessment covering ${moduleConfig.name.toLowerCase()}`,
      due_date: `getRelativeDate(${startDate + 13})`,
      status: moduleIndex < 3 ? 'graded' : 'not_started',
      grade: moduleIndex < 3 ? Math.floor(Math.random() * 15) + 80 : undefined,
      points_possible: 50,
      max_attempts: 2,
      attempts: moduleIndex < 3 ? 1 : 0
    });

    modules.push(module);
  }

  return modules;
}

// Department configurations
const departmentConfigs = {
  'Computer Science': {
    modules: [
      { name: 'Modern React Fundamentals', description: 'Component architecture, JSX, and state management basics', advancedTopic: 'Advanced React Patterns' },
      { name: 'State Management Systems', description: 'Redux, Context API, and application state architecture', advancedTopic: 'Performance Optimization Techniques' },
      { name: 'Backend Integration', description: 'APIs, authentication, and data flow patterns', advancedTopic: 'Microservices Architecture' },
      { name: 'Performance Optimization', description: 'Code splitting, lazy loading, and performance metrics', advancedTopic: 'Advanced Performance Monitoring' },
      { name: 'Testing Strategies', description: 'Unit testing, integration testing, and test-driven development', advancedTopic: 'End-to-End Testing' },
      { name: 'Deployment & DevOps', description: 'CI/CD pipelines, containerization, and cloud deployment', advancedTopic: 'Infrastructure as Code' },
      { name: 'Advanced Patterns', description: 'Design patterns, architectural decisions, and scalability', advancedTopic: 'System Design Principles' },
      { name: 'Capstone Project', description: 'Full-stack application development and portfolio creation', advancedTopic: 'Professional Development' }
    ],
    readingTypes: ['Course Textbook', 'Industry Articles'],
    assignmentTypes: ['Programming Project', 'Code Review', 'System Design', 'Implementation'],
    discussionTopics: ['Best Practices', 'Real-world Applications', 'Technical Challenges', 'Industry Trends', 'Problem Solving', 'Code Quality', 'Architecture Decisions', 'Professional Development']
  },
  'Mathematics': {
    modules: [
      { name: 'Limits and Continuity', description: 'Introduction to limits, limit laws, and continuity of functions', advancedTopic: 'Advanced Limit Techniques' },
      { name: 'Derivatives and Rules', description: 'Definition of derivatives and fundamental differentiation rules', advancedTopic: 'Advanced Differentiation Techniques' },
      { name: 'Applications of Derivatives', description: 'Related rates, optimization, and curve sketching', advancedTopic: 'Optimization and Related Rates' },
      { name: 'The Integral', description: 'Antiderivatives and the fundamental theorem of calculus', advancedTopic: 'Fundamental Theorem of Calculus' },
      { name: 'Integration Techniques', description: 'Substitution, integration by parts, and special techniques', advancedTopic: 'Advanced Integration Methods' },
      { name: 'Applications of Integration', description: 'Area, volume, and physical applications of integrals', advancedTopic: 'Physics and Engineering Applications' },
      { name: 'Differential Equations', description: 'Basic differential equations and their applications', advancedTopic: 'Solving Differential Equations' },
      { name: 'Sequences and Series', description: 'Infinite sequences, series, and convergence tests', advancedTopic: 'Convergence Tests and Applications' }
    ],
    readingTypes: ['Course Textbook', 'Supplementary Materials'],
    assignmentTypes: ['Problem Set', 'Proof Assignment', 'Mathematical Modeling', 'Applied Problems'],
    discussionTopics: ['Mathematical Concepts', 'Real-world Applications', 'Problem Solving Strategies', 'Theoretical Foundations', 'Computational Methods', 'Historical Context', 'Advanced Topics', 'Career Applications']
  },
  'English': {
    modules: [
      { name: 'Poetry and Poetic Devices', description: 'Analysis of poetic forms, meter, imagery, and figurative language', advancedTopic: 'Advanced Poetic Analysis' },
      { name: 'Short Fiction Techniques', description: 'Narrative structure, character development, and thematic analysis', advancedTopic: 'Contemporary Fiction Trends' },
      { name: 'Drama and Performance', description: 'Theatrical elements, dramatic structure, and performance analysis', advancedTopic: 'Modern Drama Movements' },
      { name: 'Novel Study and Analysis', description: 'Extended narrative forms, complex characterization, and social contexts', advancedTopic: 'Global Literature Perspectives' },
      { name: 'Literary Theory and Criticism', description: 'Critical approaches, theoretical frameworks, and interpretive methods', advancedTopic: 'Contemporary Critical Theory' },
      { name: 'Cultural and Historical Contexts', description: 'Literature in historical periods, cultural movements, and social change', advancedTopic: 'Postcolonial Literature' },
      { name: 'Research and Documentation', description: 'Research methods, source evaluation, and academic writing', advancedTopic: 'Digital Humanities Methods' },
      { name: 'Portfolio and Reflection', description: 'Synthesis of learning, critical reflection, and academic portfolio', advancedTopic: 'Professional Writing Skills' }
    ],
    readingTypes: ['Literature: A Portable Anthology', 'Critical Essays'],
    assignmentTypes: ['Literary Analysis', 'Research Paper', 'Creative Writing', 'Critical Essay'],
    discussionTopics: ['Literary Themes', 'Cultural Analysis', 'Character Studies', 'Historical Context', 'Critical Interpretations', 'Genre Conventions', 'Author Studies', 'Contemporary Relevance']
  }
};

// Enhanced course replacement function
function enhanceAllCourses() {
  try {
    console.log('🚀 Starting comprehensive course enhancement...');
    
    const mockApiPath = path.join(__dirname, 'src', 'lib', 'mockCanvasApi.ts');
    let content = fs.readFileSync(mockApiPath, 'utf8');
    
    // Course mappings
    const courseEnhancements = [
      {
        courseCode: 'ENG101',
        departmentKey: 'English',
        currentGrade: 0,
        totalPoints: 1400
      },
      {
        courseCode: 'ENG102', 
        departmentKey: 'English',
        currentGrade: 0,
        totalPoints: 1400
      },
      {
        courseCode: 'ENG201',
        departmentKey: 'English', 
        currentGrade: 0,
        totalPoints: 1400
      },
      {
        courseCode: 'CSE205',
        departmentKey: 'Computer Science',
        currentGrade: 0, 
        totalPoints: 1620
      },
      {
        courseCode: 'CSE463',
        departmentKey: 'Computer Science',
        currentGrade: 0,
        totalPoints: 1620
      },
      {
        courseCode: 'CSE445',
        departmentKey: 'Computer Science', 
        currentGrade: 0,
        totalPoints: 1620
      },
      {
        courseCode: 'CSE475',
        departmentKey: 'Computer Science',
        currentGrade: 0,
        totalPoints: 1620
      }
    ];

    let enhancedCount = 0;
    
    // Process each course enhancement
    for (const enhancement of courseEnhancements) {
      console.log(`📚 Enhancing ${enhancement.courseCode}...`);
      
      const departmentConfig = departmentConfigs[enhancement.departmentKey];
      if (!departmentConfig) {
        console.log(`⚠️  No configuration found for department: ${enhancement.departmentKey}`);
        continue;
      }
      
      // Generate comprehensive modules
      const enhancedModules = generateComprehensiveCourse({}, departmentConfig);
      
      // Convert modules to string format
      const modulesString = JSON.stringify(enhancedModules, null, 6)
        .replace(/"getRelativeDate\((-?\d+)\)"/g, 'getRelativeDate($1)');
      
      // Find and replace the modules section for this course
      const courseRegex = new RegExp(
        `(course_code: '${enhancement.courseCode}',[\\s\\S]*?modules: \\[)[\\s\\S]*?(\\]\\s*\\})`
      );
      
      if (courseRegex.test(content)) {
        content = content.replace(courseRegex, `$1\n${modulesString}\n    $2`);
        
        // Update total points and current grade
        const pointsRegex = new RegExp(`(course_code: '${enhancement.courseCode}',[\\s\\S]*?total_points: )\\d+`);
        const gradeRegex = new RegExp(`(course_code: '${enhancement.courseCode}',[\\s\\S]*?current_grade: )\\d+`);
        
        content = content.replace(pointsRegex, `$1${enhancement.totalPoints}`);
        content = content.replace(gradeRegex, `$1${enhancement.currentGrade}`);
        
        enhancedCount++;
        console.log(`✅ Enhanced ${enhancement.courseCode}`);
      } else {
        console.log(`⚠️  Could not find course ${enhancement.courseCode} for enhancement`);
      }
    }
    
    // Write the enhanced content back to file
    fs.writeFileSync(mockApiPath, content, 'utf8');
    
    console.log(`🎉 Successfully enhanced ${enhancedCount} courses!`);
    console.log('📋 Enhanced courses:');
    courseEnhancements.slice(0, enhancedCount).forEach(course => {
      console.log(`   • ${course.courseCode} (${course.departmentKey})`);
    });
    
    return {
      success: true,
      enhancedCount,
      courses: courseEnhancements.slice(0, enhancedCount).map(c => c.courseCode)
    };
    
  } catch (error) {
    console.error('❌ Enhancement failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the enhancement if this file is executed directly
if (require.main === module) {
  const result = enhanceAllCourses();
  console.log('📊 Enhancement Result:', result);
}

module.exports = { enhanceAllCourses }; 