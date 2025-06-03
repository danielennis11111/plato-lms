import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { CourseCard } from '@/components/course-card';
import { CourseGeneratorForm } from '@/components/course-generator-form';

export default async function CoursesPage() {
  const courses = await mockCanvasApi.getCourses();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Courses</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
          <CourseGeneratorForm />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
} 