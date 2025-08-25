// src/app/api/admin/users/edit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Verify admin token
const verifyAdmin = (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("No token provided");
  const token = authHeader.split(" ")[1];
  const decoded: any = jwt.verify(token, JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Not authorized");
  return decoded;
};

export async function PUT(req: NextRequest) {
  try {
    verifyAdmin(req);

    const { id, name, email, role } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "User ID required" });

    const { User } = await getModels();
    const user = await User.findByPk(id);
    if (!user) return NextResponse.json({ success: false, error: "User not found" });

    await user.update({ name, email, role });
    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
