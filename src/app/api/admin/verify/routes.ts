// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ valid: false, error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );

    return NextResponse.json({ valid: true, decoded });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: "Invalid or expired token" }, { status: 401 });
  }
}
