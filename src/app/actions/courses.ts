'use server';

import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { revalidatePath } from 'next/cache';
import { generateCourseFromPrompt } from '@/lib/courseGenerator';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { UserService } from '@/lib/userService';
import { addDays, addWeeks, format } from 'date-fns';

export async function deleteCourse(courseId: number) {
  try {
    await mockCanvasApi.deleteCourse(courseId);
    revalidatePath('/courses');
    return { success: true };
  } catch (error) {
    console.error('Error deleting course:', error);
    return { success: false, error: 'Failed to delete course' };
  }
}

export async function createCourseFromPrompt(prompt: string, userId?: string, apiKey?: string) {
  try {
    console.log('🎓 Creating course from prompt:', prompt.substring(0, 100) + '...');
    console.log('👤 User ID:', userId);
    
    // If no userId provided, try to get from current session
    if (!userId) {
      const session = UserService.getCurrentSession();
      userId = session?.user.id;
    }
    
    if (!userId) {
      console.log('❌ No user ID available');
      return { success: false, error: 'User authentication required' };
    }

    console.log('🔑 API key provided:', apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO');
    
    let courseData;
    
    if (apiKey) {
      console.log('🤖 Using Gemini API for intelligent course generation');
      courseData = await generateCourseWithGemini(prompt, apiKey);
    } else {
      console.log('📝 Using basic prompt parsing (no API key)');
      courseData = generateCourseFromPrompt(prompt);
    }
    
    // Add course to global course list
    await mockCanvasApi.addCourse(courseData);
    
    // Enroll the user in the course
    const userData = UserService.getUserData(userId);
    if (userData) {
      // Add course to user's enrollments
      if (!userData.courseProgress) {
        userData.courseProgress = {};
      }
      
      userData.courseProgress[courseData.id.toString()] = {
        courseId: courseData.id.toString(),
        enrolledAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        completedModules: [],
        assignmentSubmissions: {},
        quizAttempts: {},
        discussionParticipation: {},
        currentGrade: 0,
        timeSpent: 0
      };
      
      UserService.saveUserData(userId, userData);
      console.log('✅ User enrolled in course:', courseData.name);
    }
    
    revalidatePath('/courses');
    revalidatePath('/');
    return { success: true, course: courseData };
  } catch (error) {
    console.error('Error creating course:', error);
    return { success: false, error: 'Failed to create course' };
  }
}

async function generateCourseWithGemini(prompt: string, apiKey: string) {
  console.log('🚀 Generating course with Gemini API...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const systemPrompt = `You are an expert curriculum designer. Create a comprehensive course based on the user's request.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "name": "Course Name",
  "course_code": "CODE123", 
  "description": "Detailed course description",
  "instructor": "Instructor Name",
  "term": "Summer 2025",
  "start_date": "2025-06-03",
  "end_date": "2025-08-15",
  "total_points": 1000,
  "modules": [
    {
      "id": 1,
      "name": "Module 1: Introduction",
      "description": "Module description",
      "is_completed": false,
      "items": [
        {
          "id": 101,
          "title": "Welcome to the Course",
          "type": "page",
          "content": "Detailed content here",
          "due_date": "2025-06-10",
          "status": "not_started",
          "points_possible": 0
        },
        {
          "id": 102,
          "title": "Assignment 1",
          "type": "assignment", 
          "content": "Assignment description",
          "due_date": "2025-06-12",
          "status": "not_started",
          "points_possible": 100,
          "submissions": 0,
          "attempts": 0,
          "max_attempts": 3
        }
      ]
    }
  ]
}

Guidelines:
- Create 6-8 modules for a full course
- Each module should have 3-4 items: page, assignment, quiz, discussion
- Use realistic due dates spread over the term (June 3 - Aug 15, 2025)
- Make content specific to the subject matter
- Total points should add up to around 1000
- Include varied assignment types and point values
- Make module names descriptive and progressive

User request: "${prompt}"`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    const response = result.response.text();
    console.log('🎯 Gemini response length:', response.length);
    
    // Clean the response to extract JSON
    let jsonText = response.trim();
    
    // Remove any markdown formatting
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const courseData = JSON.parse(jsonText);
    
    // Ensure required fields and assign a unique ID
    const courses = await mockCanvasApi.getCourses();
    const nextId = Math.max(...courses.map(c => c.id), 0) + 1;
    
    return {
      id: nextId,
      ...courseData,
      syllabus: generateSyllabus(courseData)
    };
    
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    // Fallback to basic generation
    console.log('🔄 Falling back to basic generation');
    return generateCourseFromPrompt(prompt);
  }
}

function generateSyllabus(courseData: any): string {
  return `Course Overview:
${courseData.description}

Course Information:
• Course Code: ${courseData.course_code}
• Instructor: ${courseData.instructor}
• Term: ${courseData.term}
• Dates: ${format(new Date(courseData.start_date), 'MMM d')} - ${format(new Date(courseData.end_date), 'MMM d, yyyy')}

Course Structure:
The course is divided into ${courseData.modules?.length || 0} modules:
${courseData.modules?.map((module: any, index: number) => 
  `${index + 1}. ${module.name}`
).join('\n') || ''}

Each module includes:
• Reading materials and lectures
• Practical assignments
• Discussion participation  
• Assessments and quizzes

Grading:
• Assignments: 40%
• Quizzes: 30%
• Discussions: 20%
• Participation: 10%

Total Points: ${courseData.total_points} points`;
} 