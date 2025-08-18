import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDbInitialized } from "@/lib/db-singleton";

export async function POST(req: NextRequest) {
  try {
    // Ensure database is initialized
    await ensureDbInitialized();
    
    // Import User model after database initialization
    const { User } = await import("@/models");
    
    const body = await req.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Additional validation
    if (name.trim().length < 2) {
      return NextResponse.json({ message: "Name must be at least 2 characters" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

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
      email: email.toLowerCase(),
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
        message: "User registered successfully. Your account is pending admin approval.", 
        user: userSafe 
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("Registration error:", err);
    
    // Handle specific Sequelize errors
    if (err.name === 'SequelizeValidationError') {
      const validationErrors = err.errors.map((error: any) => error.message).join(', ');
      return NextResponse.json(
        { message: `Validation error: ${validationErrors}` }, 
        { status: 400 }
      );
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json(
        { message: "Email already registered" }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error. Please try again later." }, 
      { status: 500 }
    );
  }
}