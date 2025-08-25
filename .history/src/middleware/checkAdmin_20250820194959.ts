import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // fallback for safety

export function checkAdmin(req: NextRequest): NextResponse | null {
  try {
    // 🔑 Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 401 });
    }

    // 🔎 Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

    // 👮 Only allow admins
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
    }

    // ✅ Authorized, return null so the API route continues
    return null;
  } catch (err) {
    console.error("checkAdmin error:", err);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
