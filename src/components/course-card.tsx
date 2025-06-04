'use client';

import { Course } from '@/lib/mockCanvasApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteCourse } from '@/app/actions/courses';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this course?')) {
      const result = await deleteCourse(course.id);
      if (result.success) {
        router.refresh();
      } else {
        alert('Failed to delete course');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <CardDescription>{course.course_code}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{course.description}</p>
        <div className="mt-2 text-sm">
          <p>Instructor: {course.instructor}</p>
          <p>Term: {course.term}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/courses/${slugify(course.name)}`}>
          <Button variant="outline">View Course</Button>
        </Link>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
} 