// src/middleware/checkAdmin.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // fallback for dev

export function checkAdmin(req: NextRequest): NextResponse | null {
  try {
    // 🔑 Get token from Authorization header
    const authHeader =
      req.headers.get("Authorization") || req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"

    // 🔎 Verify JWT
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    const decoded = payload as {
      id: number;
      role: string;
      email?: string;
    };

    // 👮 Only allow admins
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admins only" },
        { status: 403 }
      );
    }

    // ✅ Authorized → allow API route to continue
    return null;
  } catch (err: any) {
    console.error("checkAdmin error:", err.message);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
