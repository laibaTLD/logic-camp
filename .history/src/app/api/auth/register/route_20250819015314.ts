// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getModels } from "@/lib/db-connection";

export async function POST(req: NextRequest) {
  try {
    // Ensure database is initialized and get models
    const { User } = await getModels();
    
    const body = await req.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Additional validation
    if (name.trim().length < 2) {
      return NextResponse.json({ message: "Name must be at least 2 characters long" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security

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

    return NextResponse.json(
      { 
        message: "User registered successfully. Please wait for admin approval.", 
        user: userSafe 
      },
      { status: 201 }
    );
    
  } catch (err: any) {
    console.error("Registration error:", err);
    
    // Handle specific database errors
    if (err.name === 'SequelizeValidationError') {
      return NextResponse.json({ 
        message: "Validation error: " + err.errors.map((e: any) => e.message).join(', ') 
      }, { status: 400 });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ 
        message: "Email already exists" 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      message: "Internal server error. Please try again later." 
    }, { status: 500 });
  }
}