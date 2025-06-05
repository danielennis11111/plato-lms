export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  context?: {
    type: 'course' | 'assignment' | 'module' | 'dashboard' | 'calendar' | 'discussion' | 'quiz' | 'general' | 'instructor_dashboard';
    id?: number;
    courseId?: number;
    title?: string;
    topic?: string;
    state?: string;
  };
}

export interface ChatContext {
  type: 'course' | 'assignment' | 'module' | 'dashboard' | 'calendar' | 'discussion' | 'quiz' | 'general' | 'instructor_dashboard';
  id?: number;
  courseId?: number;
  title?: string;
  topic?: string;
  state?: string;
} 