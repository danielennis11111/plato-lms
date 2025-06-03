import { mockCanvasApi } from '@/lib/mockCanvasApi';
import DashboardClient from './dashboard/DashboardClient';

export default async function Home() {
  try {
    const [courses, assignments] = await Promise.all([
      mockCanvasApi.getCourses(),
      mockCanvasApi.getAssignments(),
    ]);

    return <DashboardClient courses={courses} assignments={assignments} />;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Error Loading Dashboard</h2>
        <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }
}
