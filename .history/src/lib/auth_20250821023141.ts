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

    if (
      (typeof payload.userId !== "number") return null 
      typeof payload.role !== "string" ||
      typeof payload.email !== "string"
    ) {
      console.error("Invalid JWT payload:", payload);
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Authenticate user middleware
 */
export async function authenticateUser(request: NextRequest): Promise<JWTPayload | NextResponse> {
  const payload = await verifyToken(request);
  if (!payload) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  if (payload.exp && Date.now() >= payload.exp * 1000)
    return NextResponse.json({ error: "Token expired" }, { status: 401 });

  return payload;
}

/**
 * Require specific roles for a route
 */
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<NextResponse | JWTPayload> => {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    if (!allowedRoles.includes(authResult.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    return authResult;
  };
}
