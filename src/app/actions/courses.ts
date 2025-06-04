'use server';

import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { revalidatePath } from 'next/cache';
import { generateCourseFromPrompt, generateEnhancedCourseFromPrompt } from '@/lib/courseGenerator';
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

export async function createCourseFromPrompt(prompt: string, userId?: string) {
  try {
    console.log('🎓 Creating course from prompt:', prompt.substring(0, 100) + '...');
    console.log('👤 User ID:', userId);
    
    // If no userId provided, try to get from current session
    if (!userId) {
      const session = UserService.getCurrentSession();
      userId = session?.user.id;
      console.log('📋 Retrieved user ID from session:', userId);
    }
    
    if (!userId) {
      console.log('❌ No user ID available');
      return { success: false, error: 'User authentication required' };
    }

    // Get user's API key for Gemini with detailed debugging
    console.log('🔍 Checking for user API key...');
    let userData = UserService.getUserData(userId);
    console.log('📊 User data exists:', !!userData);
    
    // If user data doesn't exist, initialize it
    if (!userData) {
      console.log('🔧 Initializing user data for:', userId);
      const initialUserData = {
        chatHistories: {},
        courseProgress: {},
        settings: {
          theme: 'system' as const,
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            browser: true,
            assignments: true,
            discussions: true,
            grades: true,
          },
          accessibility: {
            highContrast: false,
            fontSize: 'medium' as const,
            reducedMotion: false,
          },
          privacy: {
            profileVisibility: 'private' as const,
            shareProgress: false,
            allowAnalytics: true,
          },
        },
        apiKeys: [],
        personalNotes: {},
        bookmarks: [],
      };
      
      UserService.saveUserData(userId, initialUserData);
      userData = UserService.getUserData(userId);
      console.log('✅ User data initialized and verified:', !!userData);
    }
    
    console.log('🔑 API keys available:', userData?.apiKeys?.length || 0);
    
    const apiKey = UserService.getActiveAPIKey(userId, 'gemini');
    console.log('🎯 Active Gemini API key found:', !!apiKey);
    
    if (apiKey) {
      console.log('✨ API key length:', apiKey.length);
      console.log('🔐 API key prefix:', apiKey.substring(0, 8) + '...');
    } else {
      console.log('⚠️ No Gemini API key found. User can add one in Settings page.');
      console.log('💡 Available API keys for this user:', userData?.apiKeys?.map(k => ({ provider: k.provider, isActive: k.isActive, name: k.name })));
    }
    
    let courseData;
    
    if (apiKey) {
      console.log('🤖 Using Gemini API for intelligent course generation');
      courseData = await generateCourseWithGemini(prompt, apiKey);
    } else {
      console.log('📝 Using enhanced local parsing (no API key - user can add one in Settings)');
      courseData = generateEnhancedCourseFromPrompt(prompt);
    }
    
    console.log('📚 Generated course:', {
      id: courseData.id,
      name: courseData.name,
      course_code: courseData.course_code,
      instructor: courseData.instructor
    });
    
    // Add course to global course list
    await mockCanvasApi.addCourse(courseData);
    console.log('✅ Course added to global course list');
    
    // Enroll the user in the course
    if (userData) {
      // Add course to user's enrollments
      if (!userData.courseProgress) {
        userData.courseProgress = {};
      }
      
      const courseId = courseData.id.toString();
      userData.courseProgress[courseId] = {
        courseId: courseId,
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
      console.log('📈 Total enrolled courses for user:', Object.keys(userData.courseProgress).length);
      
      // Verify enrollment was saved
      const verifyUserData = UserService.getUserData(userId);
      const isEnrolled = verifyUserData?.courseProgress?.[courseId];
      console.log('🔍 Enrollment verification:', !!isEnrolled);
    } else {
      console.log('❌ Could not enroll user - userData still null');
    }
    
    revalidatePath('/courses');
    revalidatePath('/');
    return { success: true, course: courseData };
  } catch (error) {
    console.error('❌ Error creating course:', error);
    return { success: false, error: 'Failed to create course' };
  }
}

async function generateCourseWithGemini(prompt: string, apiKey: string) {
  console.log('🚀 Generating course with Gemini API...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const systemPrompt = `You are an expert curriculum designer and course data parser. Analyze the provided course information and create a comprehensive course structure.

The user may provide:
1. Raw course catalog text (like university course descriptions)
2. Simple course requests
3. Mixed format course information

Your task is to extract key information and create a well-structured academic course.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "name": "Course Name",
  "course_code": "CODE123", 
  "description": "Detailed course description (expand from original if needed)",
  "instructor": "Instructor Name(s)",
  "term": "Summer 2025",
  "start_date": "2025-06-03",
  "end_date": "2025-08-15",
  "total_points": 1000,
  "modules": [
    {
      "id": 1,
      "name": "Module 1: Introduction and Foundations",
      "description": "Module description",
      "is_completed": false,
      "items": [
        {
          "id": 101,
          "title": "Course Introduction",
          "type": "page",
          "content": "Detailed content here",
          "due_date": "2025-06-10T23:59:59Z",
          "status": "not_started",
          "points_possible": 0
        },
        {
          "id": 102,
          "title": "Assignment Name",
          "type": "assignment", 
          "content": "Assignment description",
          "due_date": "2025-06-15T23:59:59Z",
          "status": "not_started",
          "points_possible": 100,
          "submissions": 0,
          "attempts": 0,
          "max_attempts": 3
        },
        {
          "id": 103,
          "title": "Knowledge Check Quiz",
          "type": "quiz",
          "content": "Quiz description",
          "due_date": "2025-06-18T23:59:59Z",
          "status": "not_started",
          "points_possible": 50,
          "submissions": 0,
          "attempts": 0,
          "max_attempts": 2
        },
        {
          "id": 104,
          "title": "Discussion Topic",
          "type": "discussion",
          "content": "Discussion prompt",
          "due_date": "2025-06-20T23:59:59Z",
          "status": "not_started",
          "points_possible": 25,
          "submissions": 0,
          "attempts": 0
        }
      ]
    }
  ]
}

Guidelines for course creation:
- Create 6-8 modules for a full course (adjust based on course duration)
- Each module should have 3-4 items: page, assignment, quiz, discussion
- For Applied Project/Capstone courses: focus on project milestones, proposals, progress reports
- For technical courses: include coding assignments, labs, implementations
- For humanities: include essays, analysis papers, creative projects
- Use realistic due dates spread over the term (June 3 - Aug 15, 2025 for summer)
- Make content specific to the subject matter and course type
- Total points should add up to around 1000
- Include varied assignment types and appropriate point values
- Make module names descriptive and show progression
- Extract actual instructor names, course codes, descriptions from the input when available
- For course duration: parse actual dates if provided, otherwise use summer 2025 defaults
- For prerequisites/requirements: incorporate into course description

Special handling for course types:
- Applied Project: Focus on proposal, literature review, methodology, implementation, presentation
- Technical/Programming: Include coding assignments, projects, debugging exercises
- Literature/Writing: Include essays, analysis papers, creative writing, peer reviews
- Science: Include labs, experiments, data analysis, research papers

Parse the following course information and create a comprehensive course structure:

"${prompt}"`;

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
    // Fallback to enhanced basic generation
    console.log('🔄 Falling back to enhanced parsing');
    return generateEnhancedCourseFromPrompt(prompt);
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