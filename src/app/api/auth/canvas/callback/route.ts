import { NextRequest, NextResponse } from 'next/server';

// Mock student data for development
const MOCK_STUDENT = {
  id: 1,
  email: 'student@example.com',
  name: 'Test Student',
  access_token: 'mock_access_token',
  refresh_token: 'mock_refresh_token'
};

const isDevelopment = process.env.NODE_ENV !== 'production';

export async function GET(request: NextRequest) {
  // In development, use mock data
  if (isDevelopment) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Store mock user data and tokens in cookies
    response.cookies.set('user', JSON.stringify({
      id: MOCK_STUDENT.id,
      email: MOCK_STUDENT.email,
      name: MOCK_STUDENT.name,
    }), {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    response.cookies.set('canvas_access_token', MOCK_STUDENT.access_token, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    response.cookies.set('canvas_refresh_token', MOCK_STUDENT.refresh_token, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  }

  // Production Canvas OAuth flow
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('canvas_oauth_state')?.value;

  // Verify state parameter to prevent CSRF
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect('/auth/login?error=invalid_state');
  }

  if (!code) {
    return NextResponse.redirect('/auth/login?error=no_code');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(process.env.CANVAS_TOKEN_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.CANVAS_CLIENT_ID,
        client_secret: process.env.CANVAS_CLIENT_SECRET,
        redirect_uri: process.env.CANVAS_REDIRECT_URI,
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const { access_token, refresh_token } = await tokenResponse.json();

    // Get user info from Canvas
    const userResponse = await fetch('https://canvas.instructure.com/api/v1/users/self', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Store user data and tokens in cookies
    response.cookies.set('user', JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name,
    }), {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    response.cookies.set('canvas_access_token', access_token, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    response.cookies.set('canvas_refresh_token', refresh_token, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Canvas OAuth error:', error);
    return NextResponse.redirect('/auth/login?error=oauth_failed');
  }
} 