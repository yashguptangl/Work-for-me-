import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Robots.txt configuration
  if (pathname === '/robots.txt') {
    const robotsTxt = `User-agent: *
Sitemap: ${request.nextUrl.origin}/sitemap.xml`;
    
    return new NextResponse(robotsTxt, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/owner/:path*', 
    '/user/:path*',
    '/robots.txt'
  ]
}