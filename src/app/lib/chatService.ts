import { mockCanvasApi } from './mockCanvasApi';

interface LearningContext {
  type: 'course' | 'assignment';
  id: number;
  name: string;
  subject?: string;
}

interface Concept {
  name: string;
  description: string;
  examples: string[];
  relatedConcepts: string[];
}

interface Character {
  name: string;
  description: string;
  role: string;
  relationships: Array<{
    character: string;
    relationship: string;
  }>;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

class ChatService {
  private static instance: ChatService;
  private conceptMaps: Map<string, Concept[]>;
  private characterBibles: Map<string, Character[]>;
  private quizQuestions: Map<string, QuizQuestion[]>;
  private currentQuiz: QuizQuestion | null = null;

  private constructor() {
    this.conceptMaps = new Map();
    this.characterBibles = new Map();
    this.quizQuestions = new Map();
    this.initializeData();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private initializeData() {
    // Initialize concept maps for different subjects
    this.conceptMaps.set('calculus', [
      {
        name: 'Limits',
        description: 'The value that a function approaches as the input approaches some value',
        examples: [
          'lim(x→0) sin(x)/x = 1',
          'lim(x→∞) 1/x = 0'
        ],
        relatedConcepts: ['Continuity', 'Derivatives', 'Infinite Series']
      },
      {
        name: 'Derivatives',
        description: 'The rate of change of a function with respect to its input',
        examples: [
          'd/dx(x²) = 2x',
          'd/dx(sin(x)) = cos(x)'
        ],
        relatedConcepts: ['Limits', 'Chain Rule', 'Product Rule']
      }
    ]);

    this.conceptMaps.set('computer_science', [
      {
        name: 'Data Structures',
        description: 'A way of organizing and storing data for efficient access and modification',
        examples: [
          'Arrays: Fixed-size collection of elements',
          'Linked Lists: Dynamic collection of nodes connected by pointers'
        ],
        relatedConcepts: ['Algorithms', 'Time Complexity', 'Space Complexity']
      },
      {
        name: 'Algorithms',
        description: 'A step-by-step procedure for solving a problem or accomplishing a task',
        examples: [
          'Sorting: Bubble Sort, Quick Sort, Merge Sort',
          'Searching: Binary Search, Linear Search'
        ],
        relatedConcepts: ['Data Structures', 'Complexity Analysis', 'Problem Solving']
      }
    ]);

    this.conceptMaps.set('chemistry', [
      {
        name: 'Atomic Structure',
        description: 'The arrangement of subatomic particles within an atom',
        examples: [
          'Protons and neutrons in the nucleus',
          'Electrons in energy levels or shells'
        ],
        relatedConcepts: ['Chemical Bonding', 'Periodic Table', 'Electron Configuration']
      },
      {
        name: 'Chemical Bonding',
        description: 'The attraction between atoms that allows the formation of chemical substances',
        examples: [
          'Ionic bonds: Transfer of electrons',
          'Covalent bonds: Sharing of electrons'
        ],
        relatedConcepts: ['Atomic Structure', 'Molecular Geometry', 'Intermolecular Forces']
      }
    ]);

    // Initialize character bibles for literature courses
    this.characterBibles.set('literature', [
      {
        name: 'Hamlet',
        description: 'The Prince of Denmark, seeking revenge for his father\'s murder',
        role: 'Protagonist',
        relationships: [
          { character: 'Claudius', relationship: 'Uncle and murderer of father' },
          { character: 'Ophelia', relationship: 'Love interest' }
        ]
      }
    ]);

    // Initialize quiz questions
    this.quizQuestions.set('calculus', [
      {
        id: 1,
        question: 'What is the derivative of f(x) = x²?',
        options: ['2x', 'x²', '2', 'x'],
        correct_answer: 0,
        explanation: 'The derivative of x² is 2x using the power rule: d/dx(x^n) = n*x^(n-1)'
      },
      {
        id: 2,
        question: 'What is the limit of sin(x)/x as x approaches 0?',
        options: ['0', '1', 'undefined', '∞'],
        correct_answer: 1,
        explanation: 'This is a fundamental limit in calculus, often used in trigonometric derivatives'
      }
    ]);

    this.quizQuestions.set('computer_science', [
      {
        id: 3,
        question: 'What is the time complexity of binary search?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct_answer: 1,
        explanation: 'Binary search divides the search interval in half each time, leading to logarithmic time complexity'
      },
      {
        id: 4,
        question: 'Which data structure uses LIFO (Last In, First Out) principle?',
        options: ['Queue', 'Stack', 'Tree', 'Graph'],
        correct_answer: 1,
        explanation: 'A stack is a linear data structure that follows the LIFO principle'
      }
    ]);

    this.quizQuestions.set('chemistry', [
      {
        question: 'What is the atomic number of Carbon?',
        options: ['6', '12', '14', '16'],
        correctAnswer: 0,
        explanation: 'Carbon has 6 protons, which defines its atomic number'
      },
      {
        question: 'Which type of bond involves the sharing of electrons?',
        options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'],
        correctAnswer: 1,
        explanation: 'Covalent bonds are formed when atoms share electrons to achieve stability'
      }
    ]);
  }

  public async processMessage(message: string, context: LearningContext): Promise<string> {
    const lowerMessage = message.toLowerCase();

    // Handle quiz answer submission
    if (this.currentQuiz && lowerMessage.match(/^[1-4]$/)) {
      return this.handleQuizAnswer(parseInt(lowerMessage), context);
    }

    // Handle concept explanation requests
    if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
      return this.handleConceptExplanation(message, context);
    }

    // Handle quiz requests
    if (lowerMessage.includes('quiz') || lowerMessage.includes('test me')) {
      return this.handleQuizRequest(context);
    }

    // Handle character analysis requests
    if (lowerMessage.includes('character') || lowerMessage.includes('who is')) {
      return this.handleCharacterAnalysis(message, context);
    }

    // Handle probing questions
    if (lowerMessage.includes('help me understand') || lowerMessage.includes('guide me')) {
      return this.handleProbingQuestions(context);
    }

    // Handle module/course content requests
    if (lowerMessage.includes('module') || lowerMessage.includes('content')) {
      return this.handleModuleContent(context);
    }

    // Default to course/assignment information
    return this.handleCourseInfo(message, context);
  }

  private async handleConceptExplanation(message: string, context: LearningContext): Promise<string> {
    const concepts = this.conceptMaps.get(context.subject?.toLowerCase() || '');
    if (!concepts) {
      return "I don't have specific concept information for this subject yet.";
    }

    const matchingConcept = concepts.find(c => 
      message.toLowerCase().includes(c.name.toLowerCase())
    );

    if (matchingConcept) {
      // Update learning progress if this is a course context
      if (context.type === 'course') {
        try {
          const course = await mockCanvasApi.courses.get(context.id);
          const objective = course.learning_objectives?.find(o => 
            o.title.toLowerCase().includes(matchingConcept.name.toLowerCase())
          );
          if (objective) {
            const checkpoint = objective.checkpoints.find(c => 
              c.title.toLowerCase().includes('understand') || 
              c.title.toLowerCase().includes('learn')
            );
            if (checkpoint && !checkpoint.completed) {
              await mockCanvasApi.learning.updateProgress(context.id, objective.id, checkpoint.id);
            }
          }
        } catch (error) {
          console.error('Error updating learning progress:', error);
        }
      }

      let response = `${matchingConcept.name}:\n\n`;
      response += `Description: ${matchingConcept.description}\n\n`;
      response += `Examples:\n${matchingConcept.examples.map(e => `- ${e}`).join('\n')}\n\n`;
      response += `Related Concepts: ${matchingConcept.relatedConcepts.join(', ')}`;
      return response;
    }

    return "I couldn't find a specific concept matching your question. Could you be more specific?";
  }

  private async handleQuizRequest(context: LearningContext): Promise<string> {
    try {
      const course = await mockCanvasApi.courses.get(context.id);
      const topic = context.subject?.toLowerCase() === 'calculus' ? 'limits' : 'python_basics';
      const questions = await mockCanvasApi.learning.getQuizQuestions(context.id, topic);
      
      if (!questions || questions.length === 0) {
        return "I don't have quiz questions prepared for this subject yet.";
      }

      this.currentQuiz = questions[Math.floor(Math.random() * questions.length)];
      let response = `Quiz Question:\n\n${this.currentQuiz.question}\n\n`;
      response += `Options:\n${this.currentQuiz.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\n`;
      response += "Enter the number of your answer (1-4).";
      return response;
    } catch (error) {
      console.error('Error getting quiz questions:', error);
      return "I'm having trouble accessing the quiz questions. Please try again.";
    }
  }

  private async handleQuizAnswer(answer: number, context: LearningContext): Promise<string> {
    if (!this.currentQuiz) {
      return "There's no active quiz question. Would you like to start a quiz?";
    }

    const isCorrect = answer - 1 === this.currentQuiz.correct_answer;
    let response = isCorrect ? "Correct! " : "Incorrect. ";
    response += this.currentQuiz.explanation;

    // Update learning progress if correct
    if (isCorrect && context.type === 'course') {
      try {
        const course = await mockCanvasApi.courses.get(context.id);
        if (course.learning_objectives) {
          const objective = course.learning_objectives.find(o => 
            o.title.toLowerCase().includes('quiz') || 
            o.title.toLowerCase().includes('practice')
          );
          if (objective) {
            const checkpoint = objective.checkpoints.find(c => 
              c.title.toLowerCase().includes('quiz') || 
              c.title.toLowerCase().includes('practice')
            );
            if (checkpoint && !checkpoint.completed) {
              await mockCanvasApi.learning.updateProgress(context.id, objective.id, checkpoint.id);
              response += "\n\nGreat job! I've updated your learning progress.";
            }
          }
        }
      } catch (error) {
        console.error('Error updating learning progress:', error);
      }
    }

    this.currentQuiz = null;
    return response;
  }

  private async handleCharacterAnalysis(message: string, context: LearningContext): Promise<string> {
    const characters = this.characterBibles.get(context.subject?.toLowerCase() || '');
    if (!characters) {
      return "I don't have character information for this subject yet.";
    }

    const matchingCharacter = characters.find(c => 
      message.toLowerCase().includes(c.name.toLowerCase())
    );

    if (matchingCharacter) {
      let response = `${matchingCharacter.name}:\n\n`;
      response += `Role: ${matchingCharacter.role}\n`;
      response += `Description: ${matchingCharacter.description}\n\n`;
      response += `Relationships:\n${matchingCharacter.relationships.map(r => 
        `- ${r.character}: ${r.relationship}`
      ).join('\n')}`;
      return response;
    }

    return "I couldn't find a specific character matching your question. Could you be more specific?";
  }

  private async handleProbingQuestions(context: LearningContext): Promise<string> {
    const questions = [
      "What specific aspect of this topic interests you the most?",
      "Can you explain your current understanding of this concept?",
      "What challenges are you facing with this material?",
      "How does this relate to what you've learned previously?",
      "What real-world applications can you think of for this concept?"
    ];

    return questions[Math.floor(Math.random() * questions.length)];
  }

  private async handleModuleContent(context: LearningContext): Promise<string> {
    try {
      const course = await mockCanvasApi.courses.get(context.id);
      if (!course.modules || course.modules.length === 0) {
        return "This course doesn't have any modules yet.";
      }

      let response = `Course Modules for ${course.name}:\n\n`;
      course.modules.forEach((module, index) => {
        response += `${index + 1}. ${module.name}\n`;
        response += `   Description: ${module.description}\n`;
        response += `   Items:\n`;
        module.items.forEach(item => {
          response += `   - ${item.title} (${item.type})\n`;
        });
        response += '\n';
      });

      return response;
    } catch (error) {
      return "I'm having trouble accessing the course modules. Please try again.";
    }
  }

  private async handleCourseInfo(message: string, context: LearningContext): Promise<string> {
    try {
      const course = await mockCanvasApi.courses.get(context.id);
      return `Course Information for ${course.name}:\n\n${course.description}`;
    } catch (error) {
      return "I'm having trouble accessing that information. Please try again.";
    }
  }
}

export const chatService = ChatService.getInstance(); 