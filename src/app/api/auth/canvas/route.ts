import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace with your Canvas OAuth credentials
const CANVAS_CLIENT_ID = process.env.CANVAS_CLIENT_ID;
const CANVAS_CLIENT_SECRET = process.env.CANVAS_CLIENT_SECRET;
const CANVAS_REDIRECT_URI = process.env.CANVAS_REDIRECT_URI || 'http://localhost:3000/api/auth/canvas/callback';
const CANVAS_AUTH_URL = process.env.CANVAS_AUTH_URL || 'https://canvas.instructure.com/login/oauth2/auth';
const USE_MOCK_API = process.env.NODE_ENV === 'development';

// Mock student data for development
const MOCK_STUDENT = {
  id: 1,
  email: 'student@example.com',
  name: 'Test Student',
  access_token: 'mock_access_token',
  refresh_token: 'mock_refresh_token'
};

export async function GET(request: NextRequest) {
  if (USE_MOCK_API) {
    // In development, redirect directly to callback with mock data
    const response = NextResponse.redirect(new URL('/api/auth/canvas/callback', request.url));
    
    // Store mock state for consistency
    response.cookies.set('canvas_oauth_state', 'mock_state', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  }

  // Generate a random state parameter to prevent CSRF
  const state = Math.random().toString(36).substring(7);

  // Store state in a cookie for verification
  const response = NextResponse.redirect(
    `${CANVAS_AUTH_URL}?client_id=${CANVAS_CLIENT_ID}&response_type=code&redirect_uri=${CANVAS_REDIRECT_URI}&state=${state}`
  );

  response.cookies.set('canvas_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
} 