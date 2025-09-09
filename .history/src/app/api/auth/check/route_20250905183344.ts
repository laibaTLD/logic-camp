import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json({ error: authResult.error || 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ user: authResult.user });
}