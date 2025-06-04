import { useState } from 'react';
import { mockCanvasApi, type Course, type ModuleItem, type Assignment } from '@/lib/mockCanvasApi';
import { format, addWeeks, startOfMonth, parse, addDays } from 'date-fns';

interface CourseGeneratorProps {
  onCourseGenerated: () => void;
}

export default function CourseGenerator({ onCourseGenerated }: CourseGeneratorProps) {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCourse = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Get current courses to determine next ID
      const courses = await mockCanvasApi.getCourses();
      const nextId = Math.max(...courses.map(c => c.id)) + 1;

      // Parse the input text to extract course information
      const courseInfo = parseCourseInput(input);
      
      // Create a new course with the extracted information
      const newCourse: Course = {
        id: nextId,
        name: courseInfo.title,
        course_code: courseInfo.code,
        description: courseInfo.description,
        instructor: courseInfo.instructor,
        term: courseInfo.term,
        start_date: courseInfo.startDate,
        end_date: courseInfo.endDate,
        total_points: courseInfo.totalPoints,
        modules: courseInfo.modules,
        syllabus: courseInfo.syllabus
      };

      // Add the course to our mock API
      await mockCanvasApi.addCourse(newCourse);
      
      // Clear input and notify parent
      setInput('');
      onCourseGenerated();
    } catch (err) {
      setError('Failed to generate course. Please try again.');
      console.error('Error generating course:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const extractCourseTitle = (text: string): string => {
    // Look for common title patterns
    const titlePatterns = [
      /Course:\s*([^\n]+)/i,
      /Title:\s*([^\n]+)/i,
      /^([^\n]+)\s*\([A-Z]{2,4}\s*\d{3,4}\)/i,
      /^([^\n]+)\s*-\s*[A-Z]{2,4}\s*\d{3,4}/i
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // If no pattern matches, try to extract from the first non-empty line
    const firstLine = text.split('\n').find(line => line.trim());
    return firstLine ? firstLine.trim() : 'New Course';
  };

  const extractCourseCode = (text: string): string => {
    // Look for common course code patterns
    const codePatterns = [
      /\(([A-Z]{2,4}\s*\d{3,4})\)/,
      /([A-Z]{2,4}\s*\d{3,4})\s*[-–]/,
      /Course Code:\s*([A-Z]{2,4}\s*\d{3,4})/i
    ];

    for (const pattern of codePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Generate a code based on the title if no code is found
    const title = extractCourseTitle(text);
    const words = title.split(/\s+/);
    const prefix = words.map(w => w[0]).join('').toUpperCase().slice(0, 3);
    return `${prefix}${Math.floor(Math.random() * 1000)}`;
  };

  const generateTopicBasedAssignments = (topic: string, week: number, courseId: number): Assignment[] => {
    const assignments: Assignment[] = [];
    const weekStart = addDays(new Date(), (week - 1) * 7);

    // Generate reading assignment based on topic
    assignments.push({
      id: courseId * 1000 + week * 10 + 1,
      name: `Week ${week}: ${topic} - Reading Assignment`,
      description: `Read and analyze the following materials related to ${topic}:
• Required reading: [Insert specific reading]
• Additional resources: [Insert resources]
• Key concepts to focus on: [Insert concepts]`,
      due_at: format(addDays(weekStart, 3), 'yyyy-MM-dd'),
      course_id: courseId,
      points_possible: 20,
      status: 'not_started',
      submissions: 0,
      attempts: 0
    });

    // Generate discussion based on topic
    assignments.push({
      id: courseId * 1000 + week * 10 + 2,
      name: `Week ${week}: ${topic} - Discussion`,
      description: `Discussion Questions:
1. How does ${topic} relate to the course objectives?
2. What are the key challenges in understanding ${topic}?
3. How can we apply ${topic} in real-world scenarios?

Requirements:
• Initial post (300-500 words)
• Respond to at least two peers
• Include relevant examples
• Cite sources when appropriate`,
      due_at: format(addDays(weekStart, 5), 'yyyy-MM-dd'),
      course_id: courseId,
      points_possible: 15,
      status: 'not_started',
      submissions: 0,
      attempts: 0
    });

    // Generate quiz based on topic
    assignments.push({
      id: courseId * 1000 + week * 10 + 3,
      name: `Week ${week}: ${topic} - Quiz`,
      description: `Quiz covering ${topic}:
• Multiple choice questions
• Short answer questions
• Application-based problems
• Case study analysis`,
      due_at: format(addDays(weekStart, 6), 'yyyy-MM-dd'),
      course_id: courseId,
      points_possible: 25,
      status: 'not_started',
      submissions: 0,
      attempts: 0,
      max_attempts: 2
    });

    return assignments;
  };

  const parseCourseInput = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // Initialize course info object
    const courseInfo: any = {
      title: extractCourseTitle(text),
      code: extractCourseCode(text),
      description: '',
      instructor: '',
      term: '',
      startDate: '',
      endDate: '',
      modules: [],
      syllabus: '',
      totalPoints: 1000,
      topics: []
    };

    // Parse course information
    let currentSection = '';
    let descriptionLines: string[] = [];
    let enrollmentReqs: string[] = [];
    let courseNotes: string[] = [];
    let topics: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line) continue;

      // Parse instructor
      if (line.startsWith('Instructor(s)')) {
        courseInfo.instructor = lines[i + 1]?.trim() || '';
        i++;
        continue;
      }

      // Parse dates
      if (line.includes(' - ')) {
        const dateMatch = line.match(/(\d{1,2}\/\d{1,2})\s*-\s*(\d{1,2}\/\d{1,2})/);
        if (dateMatch) {
          const [_, start, end] = dateMatch;
          const year = new Date().getFullYear();
          courseInfo.startDate = format(parse(`${start}/${year}`, 'M/d/yyyy', new Date()), 'yyyy-MM-dd');
          courseInfo.endDate = format(parse(`${end}/${year}`, 'M/d/yyyy', new Date()), 'yyyy-MM-dd');
          courseInfo.term = line.match(/\(([A-Z])\)/)?.[1] || '';
        }
        continue;
      }

      // Parse description
      if (line === 'Course Description') {
        currentSection = 'description';
        continue;
      } else if (line === 'Enrollment Requirements') {
        currentSection = 'enrollment';
        continue;
      } else if (line === 'Course Notes') {
        currentSection = 'notes';
        continue;
      } else if (line === 'Course Topics' || line === 'Topics') {
        currentSection = 'topics';
        continue;
      }

      // Collect section content
      if (currentSection === 'description') {
        descriptionLines.push(line);
      } else if (currentSection === 'enrollment') {
        enrollmentReqs.push(line);
      } else if (currentSection === 'notes') {
        courseNotes.push(line);
      } else if (currentSection === 'topics') {
        topics.push(line);
      }
    }

    // Set description
    courseInfo.description = descriptionLines.join(' ');

    // Extract topics from description if none were explicitly provided
    if (topics.length === 0) {
      const sentences = courseInfo.description.split(/[.!?]+/);
      topics = sentences
        .filter((s: string) => s.length > 20)
        .map((s: string) => s.trim())
        .slice(0, 8); // Limit to 8 topics
    }

    // Generate modules based on course content
    const startDate = new Date(courseInfo.startDate);
    const endDate = new Date(courseInfo.endDate);
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    courseInfo.modules = [
      {
        id: 1,
        name: "Course Overview",
        description: "Introduction to the course and key concepts",
        items: [
          {
            id: 1,
            title: "Welcome to " + courseInfo.title,
            type: "page" as const,
            content: `Welcome to ${courseInfo.title} (${courseInfo.code})\n\n${courseInfo.description}`
          },
          {
            id: 2,
            title: "Course Orientation",
            type: "page" as const,
            content: "This module will help you understand the course structure, requirements, and expectations."
          }
        ]
      }
    ];

    // Generate weekly modules with topic-based assignments
    for (let week = 1; week <= totalWeeks; week++) {
      const weekStart = addDays(startDate, (week - 1) * 7);
      const topic = topics[week % topics.length] || `Week ${week} Content`;
      
      courseInfo.modules.push({
        id: week + 1,
        name: `Week ${week}: ${topic}`,
        description: `Week ${week} content focusing on ${topic}`,
        due_date: format(addDays(weekStart, 6), 'yyyy-MM-dd'),
        items: [
          {
            id: week * 10 + 1,
            title: `Week ${week} Learning Objectives`,
            type: "page" as const,
            content: `This week's learning objectives and key concepts related to ${topic}:
• Understand the fundamental principles of ${topic}
• Apply ${topic} concepts to real-world scenarios
• Analyze and evaluate ${topic} in different contexts
• Develop critical thinking skills related to ${topic}`
          },
          {
            id: week * 10 + 2,
            title: `Week ${week} Reading Assignment`,
            type: "assignment" as const,
            due_date: format(addDays(weekStart, 3), 'yyyy-MM-dd'),
            points_possible: 20
          },
          {
            id: week * 10 + 3,
            title: `Week ${week} Discussion`,
            type: "discussion" as const,
            due_date: format(addDays(weekStart, 5), 'yyyy-MM-dd'),
            points_possible: 15
          },
          {
            id: week * 10 + 4,
            title: `Week ${week} Quiz`,
            type: "quiz" as const,
            due_date: format(addDays(weekStart, 6), 'yyyy-MM-dd'),
            points_possible: 25
          }
        ]
      });
    }

    // Add final project module
    courseInfo.modules.push({
      id: totalWeeks + 2,
      name: "Final Project",
      description: "Capstone project and assessment",
      due_date: format(addDays(endDate, -7), 'yyyy-MM-dd'),
      items: [
        {
          id: 1000,
          title: "Final Project Guidelines",
          type: "page" as const,
          content: `Final Project Guidelines for ${courseInfo.title}

Project Overview:
• Synthesize key concepts from the course
• Apply knowledge to a real-world scenario
• Demonstrate mastery of course objectives

Requirements:
• 10-15 page written report
• Presentation (15-20 minutes)
• Include relevant research and citations
• Demonstrate practical application of course concepts

Grading Criteria:
• Content and Analysis (40%)
• Research and Citations (20%)
• Presentation Quality (20%)
• Practical Application (20%)`
        },
        {
          id: 1001,
          title: "Final Project Submission",
          type: "assignment" as const,
          due_date: format(addDays(endDate, -7), 'yyyy-MM-dd'),
          points_possible: 150
        }
      ]
    });

    // Generate syllabus
    courseInfo.syllabus = `Course Overview:
${courseInfo.description}

Course Information:
• Course Code: ${courseInfo.code}
• Instructor: ${courseInfo.instructor}
• Term: ${courseInfo.term}
• Dates: ${format(new Date(courseInfo.startDate), 'MMM d')} - ${format(new Date(courseInfo.endDate), 'MMM d, yyyy')}

${enrollmentReqs.length > 0 ? `Enrollment Requirements:\n${enrollmentReqs.join('\n')}\n\n` : ''}
${courseNotes.length > 0 ? `Course Notes:\n${courseNotes.join('\n')}\n\n` : ''}
Course Structure:
The course is divided into ${totalWeeks + 2} modules:
1. Course Overview
${Array.from({ length: totalWeeks }, (_, i) => `${i + 2}. Week ${i + 1}: ${topics[i % topics.length] || `Week ${i + 1} Content`}`).join('\n')}
${totalWeeks + 2}. Final Project

Each week includes:
• Reading assignments
• Discussion participation
• Weekly quiz
• Additional activities and resources

Grading:
• Weekly Assignments (${totalWeeks * 20}%):
  - Reading Assignments: ${totalWeeks * 10}%
  - Discussions: ${totalWeeks * 5}%
  - Quizzes: ${totalWeeks * 5}%
• Midterm Project: 25%
• Final Project: 35%
• Participation: 20%

Course Policies:
• All assignments are due by 11:59 PM on their respective due dates
• Late submissions will be accepted up to 48 hours after the due date with a 10% penalty
• Discussion participation requires both initial posts and responses to peers
• Quizzes can be attempted twice, with the highest score counting
• Final project must be completed to pass the course

Communication:
• Use the course discussion forums for general questions
• Email the instructor for private matters
• Office hours: TBD

Technical Requirements:
• Reliable internet connection
• Access to course materials and resources
• Basic computer skills
• Word processing software

Academic Integrity:
• All work must be your own
• Proper citation required for all sources
• Collaboration is encouraged but must be documented
• Plagiarism will result in severe penalties`;

    return courseInfo;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Generate New Course</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="courseInput" className="block text-sm font-medium text-gray-700 mb-2">
            Paste course information (course listing, description, etc.)
          </label>
          <textarea
            id="courseInput"
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Paste course information here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <button
          onClick={generateCourse}
          disabled={isGenerating || !input.trim()}
          className={`w-full px-4 py-2 rounded-md text-white font-medium
            ${isGenerating || !input.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
            }`}
        >
          {isGenerating ? 'Generating Course...' : 'Generate Course'}
        </button>
      </div>
    </div>
  );
} 