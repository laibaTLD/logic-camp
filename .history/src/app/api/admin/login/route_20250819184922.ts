// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/models"; // adjust path to your User model

export async function POST(req: NextRequest) {
  const data = await req.json()
  try {
    const { email, password } = await req.json();

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // TODO: Generate JWT token here
    return NextResponse.json({ message: "Login successful" });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
