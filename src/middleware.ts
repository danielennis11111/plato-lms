import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that don't require authentication
const publicPaths = ['/auth/login', '/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // DEMO MODE - Skip authentication check
  // Check if user is authenticated
  // const user = request.cookies.get('user');
  // if (!user) {
  //   // Redirect to login if not authenticated
  //   const url = new URL('/auth/login', request.url);
  //   url.searchParams.set('from', pathname);
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}; 