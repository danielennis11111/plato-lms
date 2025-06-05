import { Course } from '@/types/canvas';

// Enhanced content interfaces from our music course system
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

// Generate relative dates for the summer semester
function getRelativeDate(offsetDays: number): string {
  const startDate = new Date('2025-05-28');
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + offsetDays);
  return targetDate.toISOString().split('T')[0];
}

/**
 * Enhanced Environmental Science Course Generator 
 * Based on our successful Popular Music Class Piano model
 * Tailored for Nari Miller's expertise in Water Planet
 */
export function generateEnhancedEnvironmentalScience(): Course {
  return {
    id: 8,
    name: 'Environmental Science: Water Planet',
    course_code: 'SOS 182',
    description: 'Explore Earth\'s hydrological systems and environmental processes.',
    instructor: 'Nari Miller',
    instructor_email: 'nari.miller@asu.edu',
    term: 'Summer 2025',
    total_points: 1000,
    current_grade: 0,
    start_date: getRelativeDate(-10),
    end_date: getRelativeDate(65),
    department: 'School of Earth and Space Exploration',
    credits: 3,
    prerequisites: ['None - introductory course'],
    room_location: 'ISTB4 164',
    meeting_times: 'MW 2:10-3:25 PM',
    modules: [
      {
        id: 1,
        name: 'Water Planet Fundamentals',
        description: 'Introduction to Earth\'s hydrological systems',
        is_completed: false,
        items: [
          {
            id: 801,
            title: 'Water Cycle Systems Quiz',
            type: 'quiz',
            content: 'Test understanding of global water cycle processes.',
            due_date: getRelativeDate(7),
            status: 'not_started',
            points_possible: 75,
            quiz_details: {
              id: 'env_water_cycle_quiz',
              title: 'Water Cycle Systems Assessment',
              description: 'Comprehensive evaluation of water cycle processes.',
              total_points: 75,
              attempts_allowed: 2,
              time_limit_minutes: 45,
              questions: [
                {
                  id: '1',
                  type: 'multiple_choice',
                  question: 'Which process moves water from Earth\'s surface to atmosphere?',
                  options: ['Condensation', 'Precipitation', 'Evaporation', 'Infiltration'],
                  correct_answer: 'Evaporation',
                  explanation: 'Evaporation converts liquid water to vapor using solar energy.',
                  points: 25
                },
                {
                  id: '2',
                  type: 'true_false',
                  question: 'Hillslope topography affects local erosion rates.',
                  correct_answer: true,
                  explanation: 'Slope angle and drainage patterns influence erosion.',
                  points: 25
                }
              ]
            }
          },
          {
            id: 802,
            title: 'Introduction to Earth\'s Water Systems',
            type: 'reading',
            content: 'Comprehensive overview of global hydrological processes.',
            due_date: getRelativeDate(5),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              id: 'env_water_systems_reading',
              title: 'Earth\'s Water Planet: Understanding Global Systems',
              content: 'Water shapes our planet through continuous cycling...',
              key_points: [
                'Water cycle drives fundamental Earth processes',
                'Hillslope topography controls erosion patterns',
                'Local processes connect to regional landscape evolution'
              ],
              youtube_videos: [
                {
                  id: 'al-do-HGuIk',
                  title: 'The Water Cycle Explained',
                  description: 'How water moves through Earth\'s systems.'
                }
              ],
              estimated_time_minutes: 35
            }
          }
        ]
      },
      {
        id: 2,
        name: 'Geological Processes',
        description: 'Rock weathering and landscape evolution',
        is_completed: false,
        items: [
          {
            id: 803,
            title: 'Weathering and Erosion Assignment',
            type: 'assignment',
            content: 'Analyze local weathering processes.',
            due_date: getRelativeDate(21),
            status: 'not_started',
            points_possible: 150
          }
        ]
      }
    ]
  };
} 