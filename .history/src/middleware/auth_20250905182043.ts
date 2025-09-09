import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function authMiddleware(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}