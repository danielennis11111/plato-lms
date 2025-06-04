'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Users, Clock, Reply, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { mockCanvasApi } from '@/lib/mockCanvasApi';

interface Discussion {
  id: number;
  title: string;
  message: string;
  course_id: number;
  course_name: string;
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

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const loadDiscussions = async () => {
      try {
        setLoading(true);
        
        // Load courses
        const dashboardData = await mockCanvasApi.getDashboardData();
        setCourses(dashboardData.courses);
        
        // Load discussions from all courses
        const allDiscussions: Discussion[] = [];
        
        for (const course of dashboardData.courses) {
          try {
            const courseDiscussions = await mockCanvasApi.getDiscussions(course.id);
            const discussionsWithCourse = courseDiscussions.map((discussion: any) => ({
              ...discussion,
              course_name: course.name
            }));
            allDiscussions.push(...discussionsWithCourse);
          } catch (error) {
            console.log(`No discussions found for course ${course.name}`);
          }
        }
        
        // Sort by creation date (newest first)
        allDiscussions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setDiscussions(allDiscussions);
      } catch (error) {
        console.error('Error loading discussions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiscussions();
  }, []);

  const filteredDiscussions = selectedCourse === 'all' 
    ? discussions 
    : discussions.filter(d => d.course_id.toString() === selectedCourse);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Discussion Boards</h1>
        <div className="flex space-x-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id.toString()}>
                {course.name}
              </option>
            ))}
          </select>
          <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>New Discussion</span>
          </button>
        </div>
      </div>

      {filteredDiscussions.length > 0 ? (
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => (
            <div key={discussion.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                        {discussion.course_name}
                      </span>
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
                      href={`/discussions/${discussion.id}`}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Discussions Found</h2>
          <p className="text-gray-600 mb-4">
            Start a new discussion to engage with your classmates and instructors.
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