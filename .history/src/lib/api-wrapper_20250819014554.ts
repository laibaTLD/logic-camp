// src/lib/api-wrapper.ts
import { NextRequest, NextResponse } from "next/server";
import { ensureDbInitialized } from "./db-singleton";

type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function withDatabase(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      // Ensure database is initialized before processing request
      await ensureDbInitialized();
      
      // Call the actual handler
      return await handler(req, context);
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Handle database connection errors
      if (error.name === 'SequelizeConnectionError' || 
          error.code === 'ECONNREFUSED' ||
          error.message?.includes('database') ||
          error.message?.includes('connection')) {
        return NextResponse.json(
          { message: "Database connection error. Please try again later." },
          { status: 503 }
        );
      }
      
      // Handle other errors
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

// Example usage in your register route:
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { withDatabase } from "@/lib/api-wrapper";

async function registerHandler(req: NextRequest) {
  // Import models after database is initialized (guaranteed by withDatabase wrapper)
  const { User } = await import("@/models");
  
  const body = await req.json();
  const { name, email, password } = body;

  // Validation
  if (!name || !email || !password) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  if (name.trim().length < 2) {
    return NextResponse.json({ message: "Name must be at least 2 characters" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
  }

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
}

// Export wrapped handler
export const POST = withDatabase(registerHandler);