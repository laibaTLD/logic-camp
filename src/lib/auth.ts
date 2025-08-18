import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function verifyToken(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function authenticateUser(request: NextRequest): Promise<NextResponse | JWTPayload> {
  const payload = await verifyToken(request);
  
  if (!payload) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Check if token is expired
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return NextResponse.json(
      { error: 'Token expired' },
      { status: 401 }
    );
  }

  return payload;
}

export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<NextResponse | JWTPayload> => {
    const authResult = await authenticateUser(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = authResult as JWTPayload;
    
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return payload;
  };
}
