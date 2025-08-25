import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET must be set in .env");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;
    const password = body?.password;

    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

    const { User } = await getModels();

    const admin = await User.findOne({ where: { email, role: "admin" } });
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(password, admin.getDataValue("password"));
    if (!isMatch) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    const adminData = admin.toJSON();

    // Sign JWT with userId
    const token = jwt.sign(
      { userId: adminData.id, email: adminData.email, role: adminData.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error.message || error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
