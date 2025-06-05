'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Clock, Reply, Send, Users } from 'lucide-react';
import Link from 'next/link';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { useAuth } from '@/contexts/AuthContext';
import { slugify } from '@/lib/utils';

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



export default function CourseDiscussionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, getUserData } = useAuth();

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {
    const loadDiscussion = async () => {
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
        
        // Load discussions for this course and find the specific one
        try {
          const courseDiscussions = await mockCanvasApi.getDiscussions(foundCourse.id);
          const foundDiscussion = courseDiscussions.find(d => slugify(d.title) === params.discussionSlug);
          setDiscussion(foundDiscussion || null);
        } catch (error) {
          console.error('Error loading discussion:', error);
        }
        
      } catch (error) {
        console.error('Error loading course discussion:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug && params.discussionSlug) {
      loadDiscussion();
    }
      }, [params.slug, params.discussionSlug, getUserData]);

  // Automatically store discussion context for sidebar chat
  useEffect(() => {
    if (discussion && course) {
      const discussionContext = {
        type: 'discussion' as const,
        id: discussion.id,
        title: discussion.title,
        topic: discussion.topic || 'general',
        course: course.name,
        courseCode: course.course_code,
        originalPost: {
          author: discussion.author,
          message: discussion.message,
          timestamp: discussion.created_at
        },
        replies: discussion.replies.map(reply => ({
          author: reply.author,
          message: reply.message,
          timestamp: reply.created_at
        })),
        participants: [...new Set([discussion.author, ...discussion.replies.map(r => r.author)])],
        contextSummary: `Discussion about "${discussion.title}" in ${course.name} with ${discussion.replies.length + 1} participants.`
      };
      
      localStorage.setItem('currentDiscussionContext', JSON.stringify(discussionContext));
    }
  }, [discussion, course]);



  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !user) return;

    setSubmitting(true);
    try {
      // In a real app, this would be an API call
      const newReplyObj: DiscussionReply = {
        id: Date.now(),
        message: newReply,
        author: user.name,
        created_at: new Date().toISOString()
      };

      setDiscussion(prev => prev ? {
        ...prev,
        replies: [...prev.replies, newReplyObj]
      } : null);

      setNewReply('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course || !discussion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Discussion Not Found</h1>
          <p className="text-gray-600 mb-6">The discussion you're looking for doesn't exist or has been removed.</p>
          <Link 
            href={`/courses/${params.slug}/discussions`}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course Discussions</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href={`/courses/${params.slug}`} className="hover:text-primary-600">
            {course.name}
          </Link>
          <span>/</span>
          <Link href={`/courses/${params.slug}/discussions`} className="hover:text-primary-600">
            Discussions
          </Link>
          <span>/</span>
          <span>{discussion.title}</span>
        </div>
        
        <Link 
          href={`/courses/${params.slug}/discussions`}
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Discussions</span>
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{discussion.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span>Started by {discussion.author}</span>
              </div>
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
          </div>
          

        </div>
      </div>



      {/* Main Discussion */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-medium text-sm">
                {discussion.author.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{discussion.author}</p>
              <p className="text-sm text-gray-500">{new Date(discussion.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{discussion.message}</p>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4 mb-6">
        {discussion.replies.map((reply) => (
          <div key={reply.id} className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-medium text-sm">
                    {reply.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{reply.author}</p>
                  <p className="text-sm text-gray-500">{new Date(reply.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Your Reply</h3>
          <form onSubmit={handleSubmitReply}>
            <div className="mb-4">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Share your thoughts on this discussion..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none sm:resize-y"
                disabled={submitting}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <p className="text-sm text-gray-500">
                Posting as {user?.name}
              </p>
              <button
                type="submit"
                disabled={!newReply.trim() || submitting}
                className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Posting...' : 'Post Reply'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 