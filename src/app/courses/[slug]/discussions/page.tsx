'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare, Users, Clock, Reply, Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { slugify } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Discussion {
  id: number;
  title: string;
  message: string;
  course_id: number;
  author: string;
  created_at: string;
  replies: DiscussionReply[];
  topic?: string;
}

interface DiscussionReply {
  id: number;
  message: string;
  author: string;
  created_at: string;
  personality?: string;
}

interface Course {
  id: number;
  name: string;
  course_code: string;
}

export default function CourseDiscussionsPage() {
  const params = useParams();
  const { getUserData } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseDiscussions = async () => {
      try {
        setLoading(true);
        
        // Get user enrollments from their courseProgress keys
        const userData = getUserData();
        const userEnrollments = userData?.courseProgress ? Object.keys(userData.courseProgress) : [];
        
        // Find course by slug from user's enrolled courses
        const courses = await mockCanvasApi.getCourses(userEnrollments);
        const foundCourse = courses.find(c => slugify(c.name) === params.slug);
        
        if (!foundCourse) {
          console.error('Course not found or not enrolled');
          return;
        }
        
        setCourse(foundCourse);
        
        // Load discussions for this course
        try {
          const courseDiscussions = await mockCanvasApi.getDiscussions(foundCourse.id);
          setDiscussions(courseDiscussions);
        } catch (error) {
          console.log(`No discussions found for course ${foundCourse.name}`);
          setDiscussions([]);
        }
        
      } catch (error) {
        console.error('Error loading course discussions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      loadCourseDiscussions();
    }
  }, [params.slug, getUserData]);

  const handleStartDiscussionChat = (discussion: Discussion) => {
    // Set up discussion context for chat
    const discussionContext = {
      type: 'discussion' as const,
      id: discussion.id,
      title: discussion.title,
      topic: discussion.topic || 'general'
    };
    
    // Store discussion context for chat
    localStorage.setItem('currentDiscussionContext', JSON.stringify(discussionContext));
    
    // Navigate to chat with discussion context
    window.location.href = `/chat/discussion-${discussion.id}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Link 
            href="/courses"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href={`/courses/${params.slug}`}
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {course.name}</span>
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discussions</h1>
            <p className="text-gray-600">{course.name} ({course.course_code})</p>
          </div>
          <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>New Discussion</span>
          </button>
        </div>
      </div>

      {discussions.length > 0 ? (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-gray-500">
                        by {discussion.author}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {discussion.title}
                    </h2>
                    <p className="text-gray-600 line-clamp-3">
                      {discussion.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Reply className="w-4 h-4 mr-1" />
                      <span>{discussion.replies.length} replies</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{discussion.replies.length + 1} participants</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/courses/${params.slug}/discussions/${slugify(discussion.title)}`}
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <span>View Discussion</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleStartDiscussionChat(discussion)}
                      className="flex items-center space-x-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>AI Discussion</span>
                    </button>
                  </div>
                </div>

                {discussion.replies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Replies:</h4>
                    <div className="space-y-2">
                      {discussion.replies.slice(-2).map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600">{reply.author}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Discussions Yet</h2>
          <p className="text-gray-600 mb-4">
            Start a new discussion to engage with your classmates about this course.
          </p>
          <button className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Create Discussion</span>
          </button>
        </div>
      )}
    </div>
  );
} 