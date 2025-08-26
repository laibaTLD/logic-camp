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
    if (decoded.role !== "admin") return null; // ❌ not admin
    return decoded; // ✅ valid admin
  } catch {
    return null;
  }
}

// ------------------
// GET (single user)
// ------------------
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { User } = await getModels();
  try {
    const user = await User.findByPk(params.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
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
    const user = await User.findByPk(params.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await user.update(data);
    return NextResponse.json({ message: "User updated successfully", user });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ------------------
// DELETE (remove user)
// ------------------
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { User } = await getModels();
  try {
    const user = await User.findByPk(params.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await user.destroy();
    return NextResponse.json({ message: "User deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ------------------
// PATCH (approve/reject user)
// ------------------
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { User } = await getModels();
    const { isApproved } = await req.json(); // 👈 expects { isApproved: boolean }

    if (isApproved === undefined) { // ✅ check for undefined instead of falsy
      return NextResponse.json({ error: "Missing isApproved" }, { status: 400 });
    }

    const updated = await User.update(
      { isApproved },
      { where: { id: params.id } }
    );

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
