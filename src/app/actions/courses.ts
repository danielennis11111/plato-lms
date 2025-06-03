'use server';

import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { revalidatePath } from 'next/cache';
import { generateCourseFromPrompt } from '@/lib/courseGenerator';

export async function deleteCourse(courseId: number) {
  try {
    await mockCanvasApi.deleteCourse(courseId);
    revalidatePath('/courses');
    return { success: true };
  } catch (error) {
    console.error('Error deleting course:', error);
    return { success: false, error: 'Failed to delete course' };
  }
}

export async function createCourseFromPrompt(prompt: string) {
  try {
    const course = generateCourseFromPrompt(prompt);
    await mockCanvasApi.addCourse(course);
    revalidatePath('/courses');
    return { success: true, course };
  } catch (error) {
    console.error('Error creating course:', error);
    return { success: false, error: 'Failed to create course' };
  }
} 