// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config"; // ensure .env is loaded

// Load JWT_SECRET from env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in .env file");
}

// ----------------------
// POST for admin login
// ----------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { User } = await getModels();

    // Fetch admin user
    const admin = await User.findOne({ where: { email, role: "admin" } });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(
      password,
      admin.getDataValue("password")
    );
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Convert Sequelize instance to plain object
    const adminData = admin.toJSON();

    // Ensure required fields exist
    if (!adminData.id || !adminData.email || !adminData.role) {
      console.log("Payload not found while creating token", adminData);
      return NextResponse.json(
        { message: "Payload not found while creating token" },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: adminData.id, email: adminData.email, role: adminData.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Send response
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        admin: {
          id: adminData.id,
          name: adminData.name,
          email: adminData.email,
          role: adminData.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/login error:", error.message || error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
