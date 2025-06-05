/**
 * Enhanced Environmental Science Course Generator 
 * Based on our successful Popular Music Class Piano model
 * Tailored for Nari Miller's expertise in Water Planet
 */

// Enhanced content interfaces
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
  estimated_time_minutes: number;
}

// Generate relative dates
function getRelativeDate(offsetDays: number): string {
  const startDate = new Date('2025-05-28');
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + offsetDays);
  return targetDate.toISOString().split('T')[0];
}

/**
 * Generate enhanced Environmental Science course with rich content
 * Following the successful model from Popular Music Class Piano
 */
export function generateEnhancedEnvironmentalScience() {
  return {
    id: 8,
    name: 'Environmental Science: Water Planet',
    course_code: 'SOS 182',
    description: 'Explore Earth\'s hydrological systems from hillslope processes to global patterns. Taught by Nari Miller from ASU\'s School of Earth and Space Exploration.',
    instructor: 'Nari Miller',
    instructor_email: 'nari.miller@asu.edu',
    term: 'Summer 2025',
    total_points: 1200,
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
        description: 'Introduction to Earth\'s hydrological systems and water cycle processes',
        is_completed: false,
        items: [
          {
            id: 801,
            title: 'Water Cycle Systems Quiz',
            type: 'quiz',
            content: 'Test your understanding of the global water cycle and hydrological processes.',
            due_date: getRelativeDate(7),
            status: 'not_started',
            points_possible: 100,
            quiz_details: {
              id: 'env_water_cycle_quiz',
              title: 'Water Cycle Systems Assessment',
              description: 'Comprehensive evaluation of water cycle processes and Earth systems interactions.',
              total_points: 100,
              attempts_allowed: 2,
              questions: [
                {
                  id: '1',
                  type: 'multiple_choice',
                  question: 'Which process is primarily responsible for moving water from Earth\'s surface to the atmosphere?',
                  options: ['Condensation', 'Precipitation', 'Evaporation', 'Infiltration'],
                  correct_answer: 'Evaporation',
                  explanation: 'Evaporation is the process by which solar energy converts liquid water from oceans, lakes, and rivers into water vapor that rises into the atmosphere.',
                  points: 20
                },
                {
                  id: '2',
                  type: 'true_false',
                  question: 'Hillslope topography significantly affects local erosion rates and sediment production.',
                  correct_answer: true,
                  explanation: 'Hillslope angle, drainage patterns, and vegetation cover all influence how quickly erosion occurs and how much sediment is produced in a given area.',
                  points: 20
                },
                {
                  id: '3',
                  type: 'multiple_choice',
                  question: 'What connects local hillslope processes to regional landscape evolution?',
                  options: ['Temperature variations', 'Sediment transport systems', 'Atmospheric pressure', 'Magnetic fields'],
                  correct_answer: 'Sediment transport systems',
                  explanation: 'Sediment eroded from hillslopes is transported by water and wind systems, contributing to regional patterns of landscape change over time.',
                  points: 20
                },
                {
                  id: '4',
                  type: 'short_answer',
                  question: 'Explain how transpiration by plants contributes to the water cycle.',
                  correct_answer: 'Plants absorb water through roots and release vapor through leaves',
                  explanation: 'Transpiration is the process where plants take up water through their root systems and release water vapor through their leaves, contributing significant moisture to the atmospheric part of the water cycle.',
                  points: 20
                },
                {
                  id: '5',
                  type: 'multiple_choice',
                  question: 'Which factor most directly influences the rate of chemical weathering in rocks?',
                  options: ['Wind speed', 'Temperature and moisture', 'Magnetic orientation', 'Elevation'],
                  correct_answer: 'Temperature and moisture',
                  explanation: 'Chemical weathering rates increase with higher temperatures and greater moisture availability, as these conditions accelerate chemical reactions that break down rock minerals.',
                  points: 20
                }
              ]
            }
          },
          {
            id: 802,
            title: 'Introduction to Earth\'s Water Systems',
            type: 'reading',
            content: 'Comprehensive overview of global hydrological processes and their environmental significance.',
            due_date: getRelativeDate(5),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              id: 'env_water_systems_reading',
              title: 'Earth\'s Water Planet: Understanding Global Hydrological Systems',
              content: `# Earth's Water Planet: Understanding Global Hydrological Systems

Water is the defining characteristic of our planet Earth. From vast oceans covering 71% of the surface to the intricate network of rivers, lakes, and groundwater systems, water shapes our world in countless ways.

## The Global Water Cycle

The water cycle represents one of Earth's most important and continuous processes. Solar energy drives this massive system, moving approximately 496,000 cubic kilometers of water through the atmosphere annually.

### Key Components
- **Evaporation**: Solar energy heats water in oceans, lakes, and rivers
- **Transpiration**: Plants release water vapor through their leaves  
- **Condensation**: Water vapor forms clouds and fog in the atmosphere
- **Precipitation**: Water returns to Earth's surface as rain, snow, or hail
- **Collection**: Water gathers in bodies of water and groundwater systems

## Hillslope Processes and Landscape Evolution

Understanding how local processes connect to regional patterns is fundamental to environmental science.

### Factors Affecting Erosion
- **Slope Gradient**: Steeper slopes experience faster water flow and increased erosive force
- **Drainage Patterns**: Water flow concentrates erosive forces
- **Vegetation Cover**: Plant roots stabilize soil and reduce erosion
- **Rock Type**: Different geological materials weather at varying rates

### Connecting Scales
Local hillslope processes aggregate to create regional patterns:
- Sediment eroded from hillslopes contributes to river systems
- River networks transport material across watersheds  
- Regional sediment flux affects downstream ecosystems
- Long-term patterns create the landscapes we see today

## Environmental Applications

Understanding Earth's water systems is crucial for:
- Water resource management
- Climate change adaptation
- Pollution control and remediation
- Ecosystem restoration
- Sustainable development planning`,
              key_points: [
                'The water cycle drives fundamental Earth processes and supports all life on the planet',
                'Hillslope topography and climate control erosion rates and sediment production patterns',
                'Local erosion processes connect to regional landscape evolution through sediment transport',
                'Understanding Earth systems is crucial for addressing environmental challenges'
              ],
              youtube_videos: [
                {
                  id: 'al-do-HGuIk',
                  title: 'The Water Cycle Explained',
                  description: 'Comprehensive overview of how water moves through Earth\'s systems and drives environmental processes.'
                },
                {
                  id: 'FWqVHHKq5hQ',
                  title: 'Erosion and Weathering Processes', 
                  description: 'Understanding how rocks break down and landscapes evolve through geological time.'
                }
              ],
              estimated_time_minutes: 30
            }
          },
          {
            id: 803,
            title: 'Local Water Cycle Observation',
            type: 'assignment',
            content: 'Document and analyze water cycle processes in your local environment.',
            due_date: getRelativeDate(14),
            status: 'not_started',
            points_possible: 150
          }
        ]
      },
      {
        id: 2,
        name: 'Geological Processes and Environmental Change',
        description: 'Rock weathering, soil formation, and landscape evolution processes',
        is_completed: false,
        items: [
          {
            id: 804,
            title: 'Weathering Processes Quiz',
            type: 'quiz',
            content: 'Assessment of physical and chemical weathering processes.',
            due_date: getRelativeDate(21),
            status: 'not_started',
            points_possible: 100,
            quiz_details: {
              id: 'env_weathering_quiz',
              title: 'Geological Processes Assessment',
              description: 'Evaluate understanding of weathering, erosion, and landscape evolution.',
              total_points: 100,
              attempts_allowed: 2,
              questions: [
                {
                  id: '1',
                  type: 'multiple_choice',
                  question: 'Which type of weathering involves chemical alteration of rock minerals?',
                  options: ['Physical weathering', 'Chemical weathering', 'Biological weathering', 'Thermal weathering'],
                  correct_answer: 'Chemical weathering',
                  explanation: 'Chemical weathering changes the chemical composition of minerals through processes like oxidation, hydrolysis, and carbonation.',
                  points: 50
                },
                {
                  id: '2',
                  type: 'true_false',
                  question: 'Climate has a significant influence on the rate of chemical weathering processes.',
                  correct_answer: true,
                  explanation: 'Higher temperatures and greater moisture availability accelerate chemical weathering reactions.',
                  points: 50
                }
              ]
            }
          },
          {
            id: 805,
            title: 'Landscape Evolution Through Time',
            type: 'reading',
            content: 'Understanding how geological processes shape landscapes over different timescales.',
            due_date: getRelativeDate(19),
            status: 'not_started',
            points_possible: 0,
            reading_details: {
              id: 'env_landscape_reading',
              title: 'Landscape Evolution: Connecting Process to Pattern',
              content: `# Landscape Evolution: Connecting Process to Pattern

The landscapes we see today result from millions of years of geological processes operating at different scales and rates.

## Weathering Processes
**Physical Weathering**: Mechanical breakdown through freeze-thaw cycles, thermal expansion, and physical abrasion.

**Chemical Weathering**: Chemical alteration through oxidation, hydrolysis, and carbonation reactions.

## Sediment Transport
Understanding how eroded material moves:
- **Hillslope Transport**: Creep, slides, flows
- **Fluvial Transport**: Rivers carry sediment downstream  
- **Depositional Environments**: Deltas, floodplains, ocean basins

## Human Impacts
Human activities dramatically accelerate natural processes:
- Agriculture increases erosion rates 10-100 times
- Urbanization alters drainage patterns
- Climate change affects precipitation patterns`,
              key_points: [
                'Geological processes operate across vastly different timescales',
                'Physical and chemical weathering work together to break down rocks',
                'Sediment transport connects erosion and deposition across landscapes',
                'Human activities significantly accelerate natural erosion rates'
              ],
              youtube_videos: [
                {
                  id: 'IJxW6BlIxP8',
                  title: 'Geological Time Scale',
                  description: 'Understanding deep time and rates of geological processes.'
                }
              ],
              estimated_time_minutes: 25
            }
          },
          {
            id: 806,
            title: 'Erosion Analysis Project',
            type: 'assignment',
            content: 'Analyze erosion patterns in a local watershed using GIS data.',
            due_date: getRelativeDate(28),
            status: 'not_started',
            points_possible: 200
          }
        ]
      },
      {
        id: 3,
        name: 'Environmental Chemistry and Water Quality',
        description: 'Chemical processes in natural waters and environmental impacts',
        is_completed: false,
        items: [
          {
            id: 807,
            title: 'Water Chemistry Discussion',
            type: 'discussion',
            content: 'Discuss chemical processes affecting water quality in different environments.',
            due_date: getRelativeDate(35),
            status: 'not_started',
            points_possible: 100
          },
          {
            id: 808,
            title: 'Water Quality Analysis',
            type: 'assignment',
            content: 'Analyze water quality data and propose management strategies.',
            due_date: getRelativeDate(42),
            status: 'not_started',
            points_possible: 200
          }
        ]
      },
      {
        id: 4,
        name: 'Climate Systems and Environmental Change',
        description: 'Climate processes, variability, and environmental impacts',
        is_completed: false,
        items: [
          {
            id: 809,
            title: 'Climate Change Impacts Discussion',
            type: 'discussion',
            content: 'Explore climate change effects on regional water resources.',
            due_date: getRelativeDate(49),
            status: 'not_started',
            points_possible: 100
          },
          {
            id: 810,
            title: 'Regional Climate Analysis',
            type: 'assignment',
            content: 'Research climate change impacts in your region.',
            due_date: getRelativeDate(56),
            status: 'not_started',
            points_possible: 250
          }
        ]
      },
      {
        id: 5,
        name: 'Environmental Assessment and Management',
        description: 'Methods for environmental monitoring and sustainable management',
        is_completed: false,
        items: [
          {
            id: 811,
            title: 'Environmental Monitoring Quiz',
            type: 'quiz',
            content: 'Assessment of monitoring techniques and data interpretation.',
            due_date: getRelativeDate(63),
            status: 'not_started',
            points_possible: 100
          },
          {
            id: 812,
            title: 'Capstone Research Project',
            type: 'assignment',
            content: 'Comprehensive research project integrating course concepts.',
            due_date: getRelativeDate(70),
            status: 'not_started',
            points_possible: 300
          }
        ]
      }
    ]
  };
} 