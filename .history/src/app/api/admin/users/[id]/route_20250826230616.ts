// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ------------------
// Helper: Verify Admin
// ------------------
function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return null; // not admin
    return decoded;
  } catch {
    return null;
  }
}

// ------------------
// PUT (update user)
// ------------------
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { User } = await getModels();
  try {
    const data = await req.json();
    const user = await User.findByPk(Number(params.id));
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Validate role
    if (data.role && !["employee", "teamlead", "admin"].includes(data.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Only allow updating specific fields
    const allowedUpdates: any = {};
    if (data.name) allowedUpdates.name = data.name;
    if (data.email) allowedUpdates.email = data.email;
    if (data.role) allowedUpdates.role = data.role;

    const updatedUser = await user.update(allowedUpdates);

    // Return only the updated user
    return NextResponse.json(updatedUser);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
