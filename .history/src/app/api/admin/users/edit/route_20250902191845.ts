// src/app/api/admin/users/edit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// Verify admin token
const verifyAdmin = async (req: NextRequest) => {
  const payload = await verifyToken(req);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (payload.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return payload;
};

export async function PUT(req: NextRequest) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

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
