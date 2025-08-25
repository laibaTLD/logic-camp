// File: src/lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Verify JWT token from request headers
 */
export async function verifyToken(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);

    // Ensure payload has all required fields
    if (
      typeof payload.userId !== "number" ||
      typeof payload.role !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      console.error("Invalid JWT payload:", payload);
      return null;
    }

    // Safe cast
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Authenticate user middleware
 */
export async function authenticateUser(request: NextRequest): Promise<NextResponse | JWTPayload> {
  const payload = await verifyToken(request);

  if (!payload) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Check if token is expired
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }

  return payload;
}

/**
 * Require specific roles for a route
 */
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<NextResponse | JWTPayload> => {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult as JWTPayload;
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    return payload;
  };
}
