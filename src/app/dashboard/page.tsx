import { mockCanvasApi } from '@/app/lib/mockCanvasApi';
import DashboardClient from './DashboardClient';

export default async function Dashboard() {
  try {
    const [coursesData, assignmentsData] = await Promise.all([
      mockCanvasApi.courses.list(),
      mockCanvasApi.assignments.list()
    ]);

    return <DashboardClient courses={coursesData} assignments={assignmentsData} />;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return <div className="flex items-center justify-center h-screen">Error loading dashboard data</div>;
  }
} 