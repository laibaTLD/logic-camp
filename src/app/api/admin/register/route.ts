// src/app/api/admin/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getModels } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Get models after ensuring database is initialized
    const { User } = await getModels();

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
      isApproved: true,
      // createdAt and updatedAt will be set automatically by Sequelize
    });

    return NextResponse.json({
      message: "Admin registered successfully",
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        is_active: adminUser.isActive,
        isApproved: adminUser.isApproved,
      },
    });
  } catch (err) {
    console.error("❌ Error in admin registration:", err);
    console.error("❌ Error stack:", err instanceof Error ? err.stack : 'No stack trace');
    
    // Return more detailed error information in development
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json({ 
      error: "Something went wrong",
      ...(isDev && { 
        details: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      })
    }, { status: 500 });
  }
}

// Only POST method for registration - GET moved to /api/admin/users