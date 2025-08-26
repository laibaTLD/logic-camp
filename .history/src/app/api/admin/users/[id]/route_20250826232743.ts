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
// PUT (Update User)
// ------------------
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { User } = await getModels();

  if (!params?.id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const data = await req.json();
    const user = await User.findByPk(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Validate role
    if (data.role && !["employee", "teamLead", "admin"].includes(data.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Only allow updating specific fields
    const allowedUpdates: any = {};
    if (data.name !== undefined) allowedUpdates.name = data.name;
    if (data.email !== undefined) allowedUpdates.email = data.email;
    if (data.role !== undefined) allowedUpdates.role = data.role;
    if (data.isApproved !== undefined) allowedUpdates.isApproved = data.isApproved;

    const updatedUser = await user.update(allowedUpdates);

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}

// ------------------
// PATCH (Approve / Reject User)
// ------------------
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { User } = await getModels();

  if (!params?.id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const data = await req.json();
    const user = await User.findByPk(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (typeof data.isApproved !== "boolean") {
      return NextResponse.json({ error: "isApproved must be boolean" }, { status: 400 });
    }

    const updatedUser = await user.update({ isApproved: data.isApproved });

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}

// ------------------
// DELETE (Delete User)
// ------------------
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { User } = await getModels();

  if (!params?.id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await user.destroy();

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
