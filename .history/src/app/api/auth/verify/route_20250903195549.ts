import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ valid: false, message: "No token provided" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || "default_secret";

    try {
      jwt.verify(token, secret);
      return NextResponse.json({ valid: true });
    } catch (err) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ valid: false, message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "default_secret";

    try {
      jwt.verify(token, secret);
      return NextResponse.json({ valid: true });
    } catch (err) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}
