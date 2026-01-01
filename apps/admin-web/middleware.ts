import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('adminToken')?.value;

  // Public paths that don't require authentication
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path || request.nextUrl.pathname === '/');

  // If user is on login page and has token, redirect to dashboard
  if (isPublicPath && adminToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is trying to access protected route without token, redirect to login
  if (!isPublicPath && !adminToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};