// src/app/api/admin/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getModels } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Ensure database is initialized and get models
    const { User } = await getModels();
    
    const { name, email, password } = await req.json();

    // Enhanced validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password with higher salt rounds for admin
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      isActive: true,
      isApproved: true,
    });

    // Log admin creation for security audit
    console.log(`Admin user created: ${adminUser.email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      message: "Admin registered successfully",
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
        isApproved: adminUser.isApproved,
        createdAt: adminUser.createdAt,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Admin registration error:", err);
    
    // More specific error handling
    if (err.name === 'SequelizeValidationError') {
      return NextResponse.json({ 
        error: "Validation error", 
        details: err.errors?.map(e => e.message) 
      }, { status: 400 });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Ensure database is initialized and get models
    const { User } = await getModels();
    
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "isActive", "isApproved", "createdAt", "updatedAt"],
      order: [['createdAt', 'DESC']], // Most recent first
    });

    return NextResponse.json({ 
      users,
      total: users.length 
    }, { status: 200 });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}