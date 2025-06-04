// Canvas API Integration Service
// This replaces our mock API and integrates with real Canvas LMS

export interface CanvasConfig {
  canvasUrl: string; // e.g., 'https://canvas.instructure.com'
  accessToken?: string; // User's Canvas access token
  apiKey?: string; // Institution's API key (if using)
  ltiMode?: boolean; // Whether running as LTI tool
}

export interface CanvasUser {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  short_name: string;
  sortable_name: string;
  locale?: string;
  effective_locale?: string;
  permissions?: {
    can_update_name: boolean;
    can_update_avatar: boolean;
  };
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  workflow_state: 'available' | 'completed' | 'deleted';
  account_id: number;
  start_at?: string;
  end_at?: string;
  enrollment_term_id: number;
  grading_standard_id?: number;
  is_public: boolean;
  is_public_to_auth_users: boolean;
  public_syllabus: boolean;
  public_syllabus_to_auth: boolean;
  public_description?: string;
  storage_quota_mb: number;
  is_favorite?: boolean;
  term?: {
    id: number;
    name: string;
    start_at?: string;
    end_at?: string;
  };
  enrollments?: CanvasEnrollment[];
}

export interface CanvasEnrollment {
  id: number;
  course_id: number;
  course_section_id: number;
  enrollment_state: 'active' | 'invited' | 'inactive' | 'deleted' | 'rejected' | 'completed';
  limit_privileges_to_course_section: boolean;
  root_account_id: number;
  type: 'StudentEnrollment' | 'TeacherEnrollment' | 'TaEnrollment' | 'DesignerEnrollment' | 'ObserverEnrollment';
  user_id: number;
  associated_user_id?: number;
  role: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  start_at?: string;
  end_at?: string;
  last_activity_at?: string;
  total_activity_time?: number;
  grades?: {
    html_url: string;
    current_grade?: string;
    final_grade?: string;
    current_score?: number;
    final_score?: number;
  };
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  due_at?: string;
  lock_at?: string;
  unlock_at?: string;
  has_overrides: boolean;
  all_dates?: Array<{
    due_at?: string;
    unlock_at?: string;
    lock_at?: string;
    base: boolean;
    title?: string;
  }>;
  course_id: number;
  html_url: string;
  submissions_download_url?: string;
  assignment_group_id: number;
  due_date_required: boolean;
  allowed_extensions?: string[];
  max_name_length: number;
  turnitin_enabled: boolean;
  vericite_enabled: boolean;
  turnitin_settings?: any;
  grade_group_students_individually: boolean;
  external_tool_tag_attributes?: any;
  peer_reviews: boolean;
  automatic_peer_reviews: boolean;
  peer_review_count?: number;
  peer_reviews_assign_at?: string;
  intra_group_peer_reviews: boolean;
  group_category_id?: number;
  needs_grading_count?: number;
  needs_grading_count_by_section?: Array<{
    section_id: string;
    needs_grading_count: number;
  }>;
  position: number;
  post_to_sis: boolean;
  integration_id?: string;
  integration_data?: any;
  points_possible?: number;
  submission_types: string[];
  has_submitted_submissions: boolean;
  grading_type: 'pass_fail' | 'percent' | 'letter_grade' | 'gpa_scale' | 'points';
  grading_standard_id?: number;
  published: boolean;
  unpublishable: boolean;
  only_visible_to_overrides: boolean;
  locked_for_user: boolean;
  lock_info?: any;
  lock_explanation?: string;
  quiz_id?: number;
  anonymous_submissions: boolean;
  discussion_topic?: any;
  freeze_on_copy: boolean;
  frozen: boolean;
  frozen_attributes?: string[];
  submission?: any;
  use_rubric_for_grading: boolean;
  rubric_settings?: any;
  rubric?: any;
  assignment_visibility?: number[];
  overrides?: any[];
  omit_from_final_grade: boolean;
  moderated_grading: boolean;
  grader_count?: number;
  final_grader_id?: number;
  grader_comments_visible_to_graders: boolean;
  graders_anonymous_to_graders: boolean;
  grader_names_visible_to_final_grader: boolean;
  anonymous_grading: boolean;
  allowed_attempts?: number;
  post_manually: boolean;
  score_statistics?: any;
  can_submit: boolean;
}

export interface CanvasDiscussion {
  id: number;
  title: string;
  message?: string;
  html_url: string;
  posted_at: string;
  last_reply_at?: string;
  require_initial_post: boolean;
  user_can_see_posts: boolean;
  discussion_subentry_count: number;
  read_state: 'read' | 'unread';
  unread_count: number;
  subscribed: boolean;
  subscription_hold?: string;
  assignment_id?: number;
  delayed_post_at?: string;
  published: boolean;
  lock_at?: string;
  locked: boolean;
  pinned: boolean;
  locked_for_user: boolean;
  lock_info?: any;
  lock_explanation?: string;
  user_name?: string;
  topic_children?: number[];
  group_topic_children?: any[];
  root_topic_id?: number;
  podcast_url?: string;
  discussion_type: 'side_comment' | 'threaded';
  group_category_id?: number;
  attachments?: any[];
  permissions?: {
    attach: boolean;
    update: boolean;
    reply: boolean;
    delete: boolean;
  };
  allow_rating: boolean;
  only_graders_can_rate: boolean;
  sort_by_rating: boolean;
}

export class CanvasAPIService {
  private config: CanvasConfig;
  private baseUrl: string;

  constructor(config: CanvasConfig) {
    this.config = config;
    this.baseUrl = `${config.canvasUrl}/api/v1`;
  }

  // Helper method for making Canvas API requests
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authorization header if we have an access token
    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Canvas API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User Profile
  async getCurrentUser(): Promise<CanvasUser> {
    return this.makeRequest<CanvasUser>('/users/self/profile');
  }

  async getUser(userId: number): Promise<CanvasUser> {
    return this.makeRequest<CanvasUser>(`/users/${userId}/profile`);
  }

  // Courses
  async getCourses(enrollmentState: 'active' | 'completed' | 'inactive' = 'active'): Promise<CanvasCourse[]> {
    return this.makeRequest<CanvasCourse[]>(`/courses?enrollment_state=${enrollmentState}&include[]=term&include[]=enrollments`);
  }

  async getCourse(courseId: number): Promise<CanvasCourse> {
    return this.makeRequest<CanvasCourse>(`/courses/${courseId}?include[]=term&include[]=enrollments`);
  }

  // Assignments
  async getCourseAssignments(courseId: number): Promise<CanvasAssignment[]> {
    return this.makeRequest<CanvasAssignment[]>(`/courses/${courseId}/assignments?include[]=submission&include[]=score_statistics`);
  }

  async getAssignment(courseId: number, assignmentId: number): Promise<CanvasAssignment> {
    return this.makeRequest<CanvasAssignment>(`/courses/${courseId}/assignments/${assignmentId}?include[]=submission&include[]=score_statistics`);
  }

  async getUpcomingAssignments(): Promise<CanvasAssignment[]> {
    const now = new Date().toISOString();
    const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    
    // Note: This is a simplified version. Canvas doesn't have a direct "upcoming assignments" endpoint
    // In practice, you'd fetch from multiple courses and filter
    return this.makeRequest<CanvasAssignment[]>(`/users/self/upcoming_events?type=assignment&start_date=${now}&end_date=${twoWeeksFromNow}`);
  }

  // Discussions
  async getCourseDiscussions(courseId: number): Promise<CanvasDiscussion[]> {
    return this.makeRequest<CanvasDiscussion[]>(`/courses/${courseId}/discussion_topics`);
  }

  async getDiscussion(courseId: number, discussionId: number): Promise<CanvasDiscussion> {
    return this.makeRequest<CanvasDiscussion>(`/courses/${courseId}/discussion_topics/${discussionId}`);
  }

  // Calendar Events
  async getCalendarEvents(startDate?: string, endDate?: string): Promise<any[]> {
    let url = '/calendar_events?context_codes[]=user_self';
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    return this.makeRequest<any[]>(url);
  }

  // Grades
  async getCourseGrades(courseId: number): Promise<any> {
    return this.makeRequest(`/courses/${courseId}/enrollments?user_id=self&include[]=grades`);
  }

  // Search functionality for AI context
  async searchContent(query: string, courseId?: number): Promise<any[]> {
    // Canvas search API - simplified version
    let url = `/search/recipients?search=${encodeURIComponent(query)}&type=assignment,discussion,page`;
    if (courseId) url += `&context=course_${courseId}`;
    
    return this.makeRequest<any[]>(url);
  }

  // Custom method to get comprehensive context for AI
  async getAIContext(contextType: string, contextId?: number, courseId?: number): Promise<any> {
    try {
      let contextData: any = {};

      switch (contextType) {
        case 'course':
          if (courseId) {
            contextData.course = await this.getCourse(courseId);
            contextData.assignments = await this.getCourseAssignments(courseId);
            contextData.discussions = await this.getCourseDiscussions(courseId);
          }
          break;

        case 'assignment':
          if (courseId && contextId) {
            contextData.assignment = await this.getAssignment(courseId, contextId);
            contextData.course = await this.getCourse(courseId);
          }
          break;

        case 'discussion':
          if (courseId && contextId) {
            contextData.discussion = await this.getDiscussion(courseId, contextId);
            contextData.course = await this.getCourse(courseId);
          }
          break;

        case 'dashboard':
          contextData.courses = await this.getCourses('active');
          contextData.upcomingAssignments = await this.getUpcomingAssignments();
          contextData.calendarEvents = await this.getCalendarEvents();
          break;

        default:
          // General context
          contextData.user = await this.getCurrentUser();
          contextData.courses = await this.getCourses('active');
      }

      return contextData;
    } catch (error) {
      console.error('Error fetching Canvas context:', error);
      return null;
    }
  }
}

// Factory function to create Canvas API service
export function createCanvasAPI(config: CanvasConfig): CanvasAPIService {
  return new CanvasAPIService(config);
}

// LTI Integration helpers
export interface LTIContext {
  user_id: string;
  roles: string[];
  context_id: string;
  context_title: string;
  resource_link_id: string;
  canvas_user_id: number;
  canvas_course_id: number;
  canvas_assignment_id?: number;
  canvas_api_domain: string;
}

export function parseLTIContext(ltiParams: any): LTIContext {
  return {
    user_id: ltiParams.user_id,
    roles: ltiParams.roles?.split(',') || [],
    context_id: ltiParams.context_id,
    context_title: ltiParams.context_title,
    resource_link_id: ltiParams.resource_link_id,
    canvas_user_id: parseInt(ltiParams.custom_canvas_user_id),
    canvas_course_id: parseInt(ltiParams.custom_canvas_course_id),
    canvas_assignment_id: ltiParams.custom_canvas_assignment_id ? parseInt(ltiParams.custom_canvas_assignment_id) : undefined,
    canvas_api_domain: ltiParams.custom_canvas_api_domain,
  };
}

// OAuth helper for Canvas authentication
export function getCanvasOAuthURL(canvasUrl: string, clientId: string, redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'url:GET|/api/v1/courses url:GET|/api/v1/users/:user_id/profile url:GET|/api/v1/courses/:course_id/assignments',
    ...(state && { state }),
  });

  return `${canvasUrl}/login/oauth2/auth?${params.toString()}`;
}

export async function exchangeCanvasOAuthCode(
  canvasUrl: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string
): Promise<{ access_token: string; refresh_token?: string; user: CanvasUser }> {
  const response = await fetch(`${canvasUrl}/login/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth exchange failed: ${response.status} ${response.statusText}`);
  }

  const tokenData = await response.json();
  
  // Get user info with the new token
  const userResponse = await fetch(`${canvasUrl}/api/v1/users/self/profile`, {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
  });

  const user = await userResponse.json();

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    user,
  };
}

// Gemini API Key Management (separate from Canvas)
export interface UserGeminiKey {
  userId: number; // Canvas user ID
  keyHash: string; // Encrypted Gemini API key
  name: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

// Simple service for managing Gemini API keys
export class GeminiKeyService {
  private static readonly STORAGE_KEY = 'plato_gemini_keys';

  static saveUserKey(userId: number, apiKey: string, name: string = 'Default'): void {
    const keys = this.getAllKeys();
    const existingIndex = keys.findIndex(k => k.userId === userId && k.isActive);
    
    // Deactivate existing key
    if (existingIndex >= 0) {
      keys[existingIndex].isActive = false;
    }

    // Add new key
    const newKey: UserGeminiKey = {
      userId,
      keyHash: btoa(apiKey + 'gemini_salt_2025'), // Simple encryption
      name,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    keys.push(newKey);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
  }

  static getUserKey(userId: number): string | null {
    const keys = this.getAllKeys();
    const activeKey = keys.find(k => k.userId === userId && k.isActive);
    
    if (!activeKey) return null;

    try {
      // Simple decryption
      const decoded = atob(activeKey.keyHash);
      return decoded.replace('gemini_salt_2025', '');
    } catch {
      return null;
    }
  }

  static updateLastUsed(userId: number): void {
    const keys = this.getAllKeys();
    const keyIndex = keys.findIndex(k => k.userId === userId && k.isActive);
    
    if (keyIndex >= 0) {
      keys[keyIndex].lastUsedAt = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
    }
  }

  private static getAllKeys(): UserGeminiKey[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
} 