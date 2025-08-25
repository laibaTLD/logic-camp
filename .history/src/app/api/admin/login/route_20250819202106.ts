// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getModels } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { User } = await getModels();
  try {
    // Parse request body safely
    let body: { email: string; password: string };
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error("Failed to parse request body:", parseErr);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      console.warn("Missing email or password in request");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.warn(`Login attempt failed: User not found for email ${email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compare password
    const userData = user.get({ plain: true });
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      console.warn(`Login attempt failed: Invalid password for user ${email}`);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "default_secret", // make sure JWT_SECRET exists in .env
      { expiresIn: "1h" }
    );

    console.info(`User ${email} logged in successfully`);

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.isActive,
        isApproved: user.isApproved,
      },
      token, // ✅ include JWT token in response
    });
  } catch (err: any) {
    console.error("Unexpected error in login route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
