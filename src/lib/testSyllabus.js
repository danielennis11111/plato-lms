// Quick test of syllabi generation system
const { SyllabusGenerator } = require('./syllabusGenerator.ts');

const testCourse = {
  id: 1,
  name: 'Advanced Web Development',
  course_code: 'CS380',
  description: 'Master modern web development with React, Next.js, Node.js, and cloud deployment.',
  instructor: 'Dr. Sarah Martinez',
  instructor_email: 'faculty@plato.edu',
  term: 'Summer 2025',
  total_points: 1000,
  current_grade: 87,
  start_date: '2025-05-12T00:00:00.000Z',
  end_date: '2025-08-15T00:00:00.000Z',
  department: 'Computer Science',
  credits: 4,
  room_location: 'ENGR 205',
  meeting_times: 'MWF 10:00-10:50 AM, Lab: T 2:00-4:50 PM',
  modules: [],
};

try {
  const syllabus = SyllabusGenerator.generateSyllabus(testCourse);
  console.log('✅ Syllabi Generator Test Successful!');
  console.log('\nGenerated Syllabus Preview:');
  console.log(syllabus.substring(0, 500) + '...');
  console.log('\n📊 Stats:');
  console.log(`- Length: ${syllabus.length} characters`);
  console.log(`- Course: ${testCourse.name}`);
  console.log(`- Department: ${testCourse.department}`);
} catch (error) {
  console.error('❌ Test Failed:', error.message);
} 