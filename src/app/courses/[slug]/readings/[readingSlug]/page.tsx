'use client';

import { useState, useEffect } from 'react';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import EnhancedReadingViewer from '@/components/EnhancedReadingViewer';

interface ReadingPageProps {
  params: {
    slug: string;
    readingSlug: string;
  };
}

export default function ReadingPage({ params }: ReadingPageProps) {
  const [reading, setReading] = useState<any | null>(null);
  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadingAndCourse = async () => {
      try {
        // Get course first
        const courseData = await mockCanvasApi.getCourse(params.slug);
        if (!courseData) {
          setError('Course not found');
          return;
        }
        setCourse(courseData);

        // Find the reading in the course modules
        let foundReading = null;
        for (const module of courseData.modules) {
          for (const item of module.items) {
            if (item.type === 'reading' && slugify(item.title) === params.readingSlug) {
              foundReading = item;
              break;
            }
          }
          if (foundReading) break;
        }

        if (foundReading) {
          setReading(foundReading);
        } else {
          setError('Reading not found');
        }
      } catch (error) {
        console.error('Error fetching reading:', error);
        setError('Error loading reading');
      } finally {
        setLoading(false);
      }
    };

    fetchReadingAndCourse();
  }, [params.slug, params.readingSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
        <Link
          href={`/courses/${params.slug}`}
          className="text-blue-500 hover:text-blue-600 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Course</span>
        </Link>
      </div>
    );
  }

  if (!reading || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Reading not found</h1>
        <Link
          href={`/courses/${params.slug}`}
          className="text-blue-500 hover:text-blue-600 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Course</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <Link
            href={`/courses/${params.slug}`}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{course.name}</h1>
            <p className="text-sm text-gray-600">{course.course_code} • {course.instructor}</p>
          </div>
        </div>
      </div>

      {/* Reading Content */}
      <div className="py-8">
        <EnhancedReadingViewer
          title={reading.title}
          content={reading.content}
          reading_details={reading.reading_details}
        />
      </div>
    </div>
  );
} 