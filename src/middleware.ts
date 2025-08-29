import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './middleware/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exclude public paths
  if (pathname.startsWith('/api') || pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // Protect dashboard and other routes
  const authResponse = await authMiddleware(req);
  if (authResponse.status === 302) { // Redirect if not authenticated
    return authResponse;
  }

  return authResponse;
}

export const config = {
  matcher: ['/'],
};