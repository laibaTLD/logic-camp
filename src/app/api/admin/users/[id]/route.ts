// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ------------------
// Helper: Verify Admin
// ------------------
async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.split(" ")[1];
  if (!token) return false;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

// ------------------
// PUT Handler
// ------------------
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // 1. Verify admin
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get request body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, role, isApproved } = body;

  if (!name && !email && !role && isApproved === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const { User } = await getModels();
    const user = await User.findByPk(id); // Sequelize

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isApproved !== undefined) user.isApproved = isApproved;

    await user.save();

    return NextResponse.json({ message: "User updated", user });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
