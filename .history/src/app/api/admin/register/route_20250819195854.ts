// src/app/api/admin/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/models"; // adjust path to your User model

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

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
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}


export async function GET() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({
      order: [["id", "ASC"]],
      attributes: ["id", "name", "email", "role", "isActive", "isApproved"], // select only necessary fields
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}