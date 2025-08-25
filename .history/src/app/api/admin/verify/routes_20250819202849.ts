import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ valid: false, error: "Token required" }, { status: 401 });
    }

    // Decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    return NextResponse.json({ valid: true, decoded });
  } catch (error) {
    return NextResponse.json({ valid: false, error: "Invalid or expired token" }, { status: 401 });
  }
}
