// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getModels } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Additional validation
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    // Get initialized models
    const { User } = await getModels();

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "user",
      isActive: true,
      isApproved: false,
    });

    // Return user data without password
    const userData = newUser.get({ plain: true });
    const { password: _, ...userSafe } = userData;

    console.log('✅ User registered successfully:', userSafe.email);

    return NextResponse.json(
      { 
        message: "User registered successfully. Please wait for admin approval.", 
        user: userSafe 
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("❌ Registration error:", err);
    
    // Handle specific database errors
    if (err.name === 'SequelizeValidationError') {
      const errorMessages = err.errors.map((error: any) => error.message);
      return NextResponse.json(
        { message: `Validation error: ${errorMessages.join(', ')}` }, 
        { status: 400 }
      );
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json(
        { message: "Email already exists" }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error. Please try again later." }, 
      { status: 500 }
    );
  }
}