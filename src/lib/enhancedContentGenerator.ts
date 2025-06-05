import { Course, Module, ModuleItem } from './mockCanvasApi';

export interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: number | string;
  explanation: string;
  points: number;
}

export interface Reading {
  title: string;
  content: string;
  source: string;
  estimatedTime: number;
  youtubeVideos?: Array<{
    title: string;
    videoId: string;
    description: string;
    duration: string;
  }>;
  keyPoints: string[];
  furtherReading?: string[];
}

// Music-specific quiz content
export const musicQuizQuestions = {
  'Piano Fundamentals and Posture': [
    {
      id: 1,
      question: 'What is the correct height for a piano bench?',
      type: 'multiple_choice' as const,
      options: [
        'So your arms hang naturally at a 90-degree angle',
        'As high as possible for better leverage',
        'So your forearms slope slightly downward to the keys',
        'So your wrists are above the level of your hands'
      ],
      correct_answer: 2,
      explanation: 'The bench should be adjusted so your forearms slope slightly downward (about 10-15 degrees) from elbow to wrist, allowing for relaxed, natural hand position.',
      points: 10
    },
    {
      id: 2,
      question: 'Which finger position creates the most efficient hand curve?',
      type: 'multiple_choice' as const,
      options: [
        'Completely flat fingers on the keys',
        'Extremely curved fingers like holding a small ball',
        'Slightly curved fingers as if holding a tennis ball',
        'Fingers pointing straight down'
      ],
      correct_answer: 2,
      explanation: 'The ideal hand position is achieved by slightly curving the fingers as if gently holding a tennis ball, maintaining the natural arch of the hand.',
      points: 10
    },
    {
      id: 3,
      question: 'True or False: You should always keep your shoulders raised while playing piano.',
      type: 'true_false' as const,
      options: ['True', 'False'],
      correct_answer: 1,
      explanation: 'False. Shoulders should remain relaxed and down to prevent tension and allow for fluid movement.',
      points: 5
    }
  ],
  'Popular Music Theory Essentials': [
    {
      id: 4,
      question: 'In popular music, what does the chord symbol "C7" represent?',
      type: 'multiple_choice' as const,
      options: [
        'C major chord with an added 7th',
        'C dominant 7th chord (C-E-G-Bb)',
        'C minor chord with 7th',
        'C diminished 7th chord'
      ],
      correct_answer: 1,
      explanation: 'C7 indicates a C dominant 7th chord containing C-E-G-Bb, which is fundamental in blues, jazz, and popular music.',
      points: 10
    },
    {
      id: 5,
      question: 'What is the most common chord progression in popular music?',
      type: 'multiple_choice' as const,
      options: [
        'I-V-vi-IV',
        'ii-V-I',
        'I-vi-ii-V',
        'vi-IV-I-V'
      ],
      correct_answer: 0,
      explanation: 'The I-V-vi-IV progression (like C-G-Am-F in C major) is extremely common in pop, rock, and contemporary music.',
      points: 10
    }
  ],
  'Jazz Piano Fundamentals': [
    {
      id: 6,
      question: 'What is "comping" in jazz piano?',
      type: 'multiple_choice' as const,
      options: [
        'Playing the melody line',
        'Playing rhythmic chord accompaniment',
        'Playing bass lines with the left hand',
        'Playing scales rapidly'
      ],
      correct_answer: 1,
      explanation: 'Comping (short for accompanying) refers to playing rhythmic chord progressions to support soloists or provide harmonic foundation.',
      points: 10
    },
    {
      id: 7,
      question: 'Which chord tone is typically omitted in jazz piano voicings?',
      type: 'multiple_choice' as const,
      options: [
        'The root (1st)',
        'The third (3rd)',
        'The fifth (5th)',
        'The seventh (7th)'
      ],
      correct_answer: 2,
      explanation: 'In jazz piano voicings, the fifth is often omitted because it doesn\'t add as much harmonic color as the third and seventh, which define the chord quality.',
      points: 10
    }
  ],
  'Rhythm and Popular Styles': [
    {
      id: 8,
      question: 'What is the most common time signature in popular music?',
      type: 'multiple_choice' as const,
      options: [
        '3/4 (waltz time)',
        '4/4 (common time)',
        '6/8 (compound time)',
        '2/4 (march time)'
      ],
      correct_answer: 1,
      explanation: '4/4 time is by far the most common time signature in popular music, rock, pop, and most contemporary genres.',
      points: 10
    },
    {
      id: 9,
      question: 'True or False: Syncopation means emphasizing off-beats or weak beats.',
      type: 'true_false' as const,
      options: ['True', 'False'],
      correct_answer: 0,
      explanation: 'True. Syncopation involves placing rhythmic emphasis on normally unaccented beats, creating a sense of movement and interest.',
      points: 5
    }
  ],
  'Lead Sheets and Chord Charts': [
    {
      id: 10,
      question: 'What does the chord symbol "Am7" indicate?',
      type: 'multiple_choice' as const,
      options: [
        'A major 7th chord',
        'A minor 7th chord',
        'A augmented 7th chord',
        'A dominant 7th chord'
      ],
      correct_answer: 1,
      explanation: 'Am7 represents an A minor 7th chord, containing the notes A-C-E-G.',
      points: 10
    }
  ],
  'Popular Piano Styles': [
    {
      id: 11,
      question: 'Which hand typically plays the "walking bass" pattern in boogie-woogie piano?',
      type: 'multiple_choice' as const,
      options: [
        'Right hand',
        'Left hand',
        'Both hands equally',
        'Neither - it\'s a pedal technique'
      ],
      correct_answer: 1,
      explanation: 'In boogie-woogie style, the left hand typically plays the repetitive bass patterns while the right hand plays melody and rhythm.',
      points: 10
    }
  ],
  'Performance and Expression': [
    {
      id: 12,
      question: 'What does the musical term "dynamics" refer to?',
      type: 'multiple_choice' as const,
      options: [
        'The speed of the music',
        'The key signature',
        'The volume and intensity levels',
        'The chord progressions'
      ],
      correct_answer: 2,
      explanation: 'Dynamics refer to the varying levels of volume and intensity in musical performance, from soft (piano) to loud (forte).',
      points: 10
    }
  ]
};

// Enhanced reading content with YouTube integration
export const musicReadings = {
  'Piano Fundamentals and Posture': {
    title: 'Fundamentals of Piano Technique and Posture',
    content: `
# Piano Fundamentals and Posture

## Introduction
Proper piano technique begins with establishing correct posture and hand position. This foundation is crucial for developing advanced skills and preventing injury throughout your musical journey.

## Bench Position and Height
The piano bench position affects your entire playing experience:

- **Distance from piano**: Sit at the front half of the bench, allowing your arms to hang naturally
- **Height adjustment**: Your forearms should slope slightly downward (10-15 degrees) toward the keys
- **Foot position**: Both feet should be flat on the floor or pedals

## Hand Position and Finger Curve
Developing proper hand position is essential for technical development:

### Basic Hand Shape
- Imagine gently holding a tennis ball in each hand
- Fingers should be naturally curved, not collapsed or overly arched
- Wrists should be level with hands, not dropped or raised

### Finger Independence
Each finger must develop strength and independence while maintaining the overall hand shape. Practice scales slowly, focusing on:
- Even finger pressure
- Consistent finger curve
- Relaxed wrist movement

## Common Posture Problems
Avoid these frequent mistakes:
- **Collapsed wrists**: Weakens finger action and can cause injury
- **Raised shoulders**: Creates unnecessary tension
- **Sitting too far**: Forces reaching and poor arm position
- **Rigid fingers**: Prevents fluid technical development

## Practice Recommendations
- Begin each practice session with posture awareness
- Use a mirror to check your position
- Take breaks every 20-30 minutes to reset posture
- Practice slow scales focusing on hand position

Remember: Good habits formed early will serve you throughout your musical development.
    `,
    source: 'The Complete Piano Player Series - Chapter 1',
    estimatedTime: 25,
    youtubeVideos: [
      {
        title: 'What is Perfect Piano Posture? | Hoffman Academy',
        videoId: 'BmTcXlfT1OE',
        description: 'Comprehensive guide to proper piano posture from piano experts',
        duration: '8:15'
      },
      {
        title: 'Proper Hand Posture At The Piano',
        videoId: 'rZznie6UU_o',
        description: 'Professional demonstration of correct hand positioning and finger curve',
        duration: '5:42'
      },
      {
        title: 'The 5 Basic Elements of a Correct Piano Posture',
        videoId: 'InqmH-o1cX0',
        description: 'Detailed breakdown of all five essential posture elements',
        duration: '12:18'
      }
    ],
    keyPoints: [
      'Bench height affects entire playing technique',
      'Hand curve should be natural and relaxed',
      'Proper posture prevents injury and enhances performance',
      'Regular posture checks during practice are essential'
    ],
    furtherReading: [
      'Piano Technique: The Complete Guide by Peter Feuchtwanger',
      'The Art of Piano Playing by Heinrich Neuhaus'
    ]
  },
  'Popular Music Theory Essentials': {
    title: 'Popular Music Theory: Chords, Progressions, and Analysis',
    content: `
# Popular Music Theory Essentials

## Understanding Popular Music Harmony

Popular music uses a specific harmonic language that differs from classical music theory. Understanding these patterns will help you play and compose in contemporary styles.

## Basic Chord Types in Popular Music

### Major and Minor Triads
- **Major triads**: Happy, bright sound (C-E-G)
- **Minor triads**: Sad, darker sound (C-Eb-G)

### Seventh Chords
Seventh chords add sophistication and are essential in popular music:
- **Major 7th**: C-E-G-B (smooth, jazz-influenced)
- **Dominant 7th**: C-E-G-Bb (bluesy, tension-filled)
- **Minor 7th**: C-Eb-G-Bb (mellow, sophisticated)

## Common Chord Progressions

### The I-V-vi-IV Progression
This is the most popular progression in contemporary music:
- **In C major**: C - G - Am - F
- **Examples**: "Let It Be" (Beatles), "Don't Stop Believin'" (Journey)

### The vi-IV-I-V Progression
Another extremely common pattern:
- **In C major**: Am - F - C - G
- **Examples**: "Complicated" (Avril Lavigne), "Basket Case" (Green Day)

## Chord Symbols and Lead Sheets
Popular music uses specific notation:
- **C**: C major triad
- **Cm**: C minor triad
- **C7**: C dominant 7th
- **Cmaj7**: C major 7th
- **C/E**: C major with E in the bass

## Practical Application
When playing from lead sheets:
1. Identify the key signature
2. Recognize chord patterns
3. Choose appropriate voicings for the style
4. Add rhythmic interest through comping patterns

Understanding these fundamentals allows you to play thousands of popular songs and develop your own musical ideas.
    `,
    source: 'Jazz Piano Studies - Popular Music Theory',
    estimatedTime: 35,
    youtubeVideos: [
      {
        title: '7 Super Common Chord Progressions and Why They Work',
        videoId: 'Vyc8lezaa9g',
        description: 'Analysis of the most popular chord progressions in modern music',
        duration: '16:23'
      },
      {
        title: 'Piano Chord Progressions: ULTIMATE Guide For Beginners',
        videoId: 'pb_HDDOdnxE',
        description: 'Complete beginner guide to understanding and playing chord progressions',
        duration: '24:17'
      },
      {
        title: '3 Easy-Yet-Beautiful Chord Progressions Every Beginner Should Know',
        videoId: '7WS_wasGBxA',
        description: 'Three essential progressions that work in countless popular songs',
        duration: '11:45'
      }
    ],
    keyPoints: [
      'Seventh chords are fundamental in popular music',
      'I-V-vi-IV is the most common progression',
      'Lead sheet notation is essential for popular music',
      'Chord voicings should match the musical style'
    ],
    furtherReading: [
      'The Jazz Piano Book by Mark Levine',
      'Popular Music Theory by Ger Tillekens'
    ]
  },
  'Jazz Piano Fundamentals': {
    title: 'Introduction to Jazz Piano: Voicings and Comping',
    content: `
# Jazz Piano Fundamentals

## Understanding Jazz Harmony

Jazz piano involves a different approach to harmony than classical or popular music. The emphasis is on sophisticated chord voicings, rhythmic comping, and improvisation.

## Basic Jazz Chord Voicings

### Shell Voicings
Shell voicings use only the essential chord tones:
- **Root and 7th**: The most basic shell voicing
- **3rd and 7th**: Defines the chord quality without the root
- **Guide tones**: Lead smoothly from chord to chord

### Four-Note Voicings
More complete voicings include:
- **Root position**: 1-3-5-7
- **First inversion**: 3-5-7-9
- **Rootless voicings**: 3-5-7-9 or 7-9-3-5

## Comping Fundamentals

### What is Comping?
Comping (accompanying) is the art of providing rhythmic and harmonic support. It involves:
- Playing chord voicings in rhythm
- Leaving space for soloists
- Creating forward motion through voice leading

### Basic Comping Patterns
- **On beats 2 and 4**: Creates swing feel
- **Syncopated rhythms**: Adds interest and movement
- **Charleston rhythm**: Classic jazz accompaniment

## Voice Leading Principles
- Move chord tones smoothly between changes
- Use common tones when possible
- Move other voices by step when practical
- Avoid parallel motion in outer voices

## Practice Recommendations
Start with simple jazz standards like:
- "Autumn Leaves"
- "Blue Moon"
- "All of Me"
- "Fly Me to the Moon"

Focus on smooth voice leading and steady comping rhythm before adding complexity.
    `,
    source: 'Jazz Piano Studies - Beginning Jazz',
    estimatedTime: 40,
    youtubeVideos: [
      {
        title: 'Jazz Comping Explained',
        videoId: 'pinLaSPo7Rw',
        description: 'Clear explanation of jazz piano comping techniques and rhythms',
        duration: '14:32'
      },
      {
        title: 'Comping Rhythms for Beginners',
        videoId: 'CID96bCGRRg',
        description: 'Step-by-step guide to basic jazz comping patterns',
        duration: '18:47'
      }
    ],
    keyPoints: [
      'Shell voicings use only essential chord tones (root, 3rd, 7th)',
      'Comping provides rhythmic and harmonic support',
      'Voice leading creates smooth chord progressions',
      'Practice with simple jazz standards first'
    ],
    furtherReading: [
      'The Jazz Piano Book by Mark Levine',
      'Voicing Concepts for Jazz Piano by Andy LaVerne'
    ]
  }
};

export function generateEnhancedQuiz(moduleName: string): any {
  const questions = musicQuizQuestions[moduleName as keyof typeof musicQuizQuestions] || [];
  
  return {
    questions: questions.map(q => ({
      ...q,
      id: Math.floor(Math.random() * 10000) + q.id
    })),
    timeLimit: 30,
    allowedAttempts: 2,
    instructions: `This quiz covers the key concepts from ${moduleName}. You have 30 minutes to complete it and can make up to 2 attempts. Read each question carefully and select the best answer.`,
    passingScore: 70
  };
}

export function generateEnhancedReading(moduleName: string): Reading | null {
  return musicReadings[moduleName as keyof typeof musicReadings] || null;
}

export function enhanceModuleWithContent(module: Module): Module {
  // Find and enhance quiz items
  const enhancedItems = module.items.map(item => {
    if (item.type === 'quiz') {
      const quizContent = generateEnhancedQuiz(module.name.replace(/^Module \d+: /, ''));
      return {
        ...item,
        quiz_details: {
          time_limit: quizContent.timeLimit,
          allowed_attempts: quizContent.allowedAttempts,
          questions: quizContent.questions,
          instructions: quizContent.instructions,
          passing_score: quizContent.passingScore
        }
      };
    }
    
    if (item.type === 'reading') {
      const readingContent = generateEnhancedReading(module.name.replace(/^Module \d+: /, ''));
      if (readingContent) {
        return {
          ...item,
          content: readingContent.content,
          reading_details: {
            source: readingContent.source,
            estimated_time: readingContent.estimatedTime,
            type: 'enhanced_reading' as const,
            youtube_videos: readingContent.youtubeVideos,
            key_points: readingContent.keyPoints,
            further_reading: readingContent.furtherReading
          }
        };
      }
    }
    
    return item;
  });

  return {
    ...module,
    items: enhancedItems
  };
}

export function enhanceCourseContent(course: Course): Course {
  const enhancedModules = course.modules.map(enhanceModuleWithContent);
  
  return {
    ...course,
    modules: enhancedModules
  };
} 