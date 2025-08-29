import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET must be set in .env file");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("Admin login attempt for email:", email);

    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const { User } = await getModels();

    const admin = await User.findOne({ where: { email, role: "admin" } });
    if (!admin) {
      console.log("Admin not found for email:", email);
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, admin.getDataValue("password"));
    if (!isMatch) {
      console.log("Invalid password for admin email:", email);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const adminData = admin.toJSON();

    // ✅ Use userId instead of id
    const token = jwt.sign(
  { userId: adminData.id, email: adminData.email, role: adminData.role },
  JWT_SECRET,
  { expiresIn: "8h" }
);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      admin: { id: adminData.id, name: adminData.name, email: adminData.email, role: adminData.role }
    }, { status: 200 });

    console.log("Admin login successful for email:", email);

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60,
      path: '/'
    });

    return response;

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      admin: { id: adminData.id, name: adminData.name, email: adminData.email, role: adminData.role }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
