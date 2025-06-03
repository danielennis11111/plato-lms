import { NextRequest, NextResponse } from 'next/server';
import { mockCanvasApi } from '@/app/lib/mockCanvasApi';

const USE_MOCK_API = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('canvas_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (USE_MOCK_API) {
      // In development, validate against mock API
      const user = await mockCanvasApi.auth.validateToken(token);
      if (!user) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
      return NextResponse.json({ authenticated: true, user });
    }

    // In production, validate against Canvas API
    const response = await fetch(`${process.env.CANVAS_API_URL}/users/self`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await response.json();
    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
} 