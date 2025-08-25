// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/lib/database";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Make sure you have a JWT_SECRET in your .env
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ----------------------
// GET all users
// ----------------------
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

// ----------------------
// PUT to approve a user
// ----------------------
export async function PUT(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await sequelize.authenticate();
    const [updatedRows] = await User.update(
      { isApproved: true },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return NextResponse.json({ error: "User not found or already approved" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User approved" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to approve user" }, { status: 500 });
  }
}

// ----------------------
// POST for admin login
// ----------------------
// src/app/api/admin/users/route.ts


// ----------------------
// POST for admin login with JWT
// ----------------------
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await sequelize.authenticate();

    const admin = await User.findOne({ where: { email, role: "admin" } });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token, // send token to frontend
        admin: { id: admin.id, name: admin.name, email: admin.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/admin/users login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
};
