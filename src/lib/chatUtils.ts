import { Message, ChatContext } from '@/types/chat';

// Function to check if a message is a generic greeting
export function isGenericGreeting(message: string): boolean {
  const greetings = [
    'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
    'how are you', 'how\'s it going', 'what\'s up', 'howdy', 'yo'
  ];
  
  const normalizedMessage = message.toLowerCase().trim();
  return greetings.some(greeting => normalizedMessage.includes(greeting));
}

// Function to detect if a user is asking for direct answers to assignments
export function isAskingForDirectAnswer(message: string): boolean {
  const directAnswerPatterns = [
    'give me the answer',
    'solve this for me',
    'what is the answer',
    'what\'s the answer',
    'what is the solution',
    'what\'s the solution',
    'solve this problem',
    'answer this question',
    'do this for me',
    'complete this assignment',
    'write the code for',
    'write this essay',
    'write this paper',
    'do my homework',
    'finish my assignment',
    'just tell me the answer',
    'i need the answer now',
    'give me the result',
    'solution to this problem',
    'just solve it',
    'finish this for me'
  ];
  
  const normalizedMessage = message.toLowerCase().trim();
  return directAnswerPatterns.some(pattern => normalizedMessage.includes(pattern));
}

// Function to get learning objectives based on context
export function getLearningObjectives(context: ChatContext): string {
  switch (context.type) {
    case 'course':
      return `Course Learning Objectives:
1. Understand core concepts and principles of the subject matter
2. Connect theoretical knowledge with practical applications
3. Develop critical thinking and analytical skills related to the course
4. Build problem-solving strategies specific to the field
5. Engage with course materials through active learning
6. Reflect on learning progress and identify areas for improvement
7. Synthesize information from various course modules`;
    
    case 'assignment':
      return `Assignment Learning Objectives:
1. Understand the purpose and requirements of the assignment
2. Identify key concepts and skills being assessed
3. Break down complex problems into manageable components
4. Apply relevant knowledge and methods to approach the task
5. Develop self-assessment skills by evaluating own work
6. Learn to articulate thought processes and reasoning
7. Connect assignment work to broader course objectives`;
    
    case 'module':
      return `Module Learning Objectives:
1. Master the specific content and skills covered in this module
2. Connect module concepts to previous learning and future topics
3. Apply module-specific techniques and methodologies
4. Identify real-world applications of module content
5. Track progress against module-specific learning outcomes
6. Identify and address gaps in understanding before moving forward
7. Prepare for assessments related to module content`;
    
    case 'dashboard':
    default:
      return `General Learning Objectives:
1. Develop effective study strategies and habits
2. Improve time management and organization skills
3. Build metacognitive awareness of learning processes
4. Connect learning across different courses and subjects
5. Identify personal learning strengths and challenges
6. Set and track meaningful academic goals
7. Develop resilience and growth mindset for learning`;
  }
}

// Function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Remove common words and punctuation
  const removeWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'through', 'over', 'before', 'between', 'after', 'since', 'without', 'under', 'within', 'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except', 'but', 'up', 'out', 'around', 'down', 'off', 'above', 'near'];
  const cleanStr1 = s1.split(/\s+/).filter(word => !removeWords.includes(word)).join(' ');
  const cleanStr2 = s2.split(/\s+/).filter(word => !removeWords.includes(word)).join(' ');
  
  // Calculate word overlap
  const words1 = new Set(cleanStr1.split(/\s+/));
  const words2 = new Set(cleanStr2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Function to find similar conversations
export function findSimilarConversations(
  messages: Message[],
  currentMessage: string,
  threshold: number = 0.6
): { contextKey: string; similarity: number; messages: Message[] } | null {
  // Skip if the message is a generic greeting
  if (isGenericGreeting(currentMessage)) {
    return null;
  }

  // Group messages by context
  const conversations = new Map<string, Message[]>();
  
  messages.forEach(message => {
    const contextKey = message.context ? 
      `${message.context.type}-${message.context.id}` : 
      'general';
    
    if (!conversations.has(contextKey)) {
      conversations.set(contextKey, []);
    }
    conversations.get(contextKey)?.push(message);
  });

  let bestMatch: { contextKey: string; similarity: number; messages: Message[] } | null = null;

  // Check each conversation for similarity
  conversations.forEach((convMessages, contextKey) => {
    // Get the first user message from the conversation
    const firstUserMessage = convMessages.find(m => m.role === 'user');
    if (!firstUserMessage) return;

    const similarity = calculateSimilarity(currentMessage, firstUserMessage.content);
    
    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = {
        contextKey,
        similarity,
        messages: convMessages
      };
    }
  });

  return bestMatch;
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
} 