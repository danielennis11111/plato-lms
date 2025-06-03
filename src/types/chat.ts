export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  context?: {
    type: 'course' | 'assignment' | 'module' | 'dashboard';
    id?: number;
    courseId?: number;
    title?: string;
  };
}

export interface ChatContext {
  type: 'course' | 'assignment' | 'module' | 'dashboard';
  id?: number;
  courseId?: number;
  title?: string;
} 