import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function authMiddleware(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}