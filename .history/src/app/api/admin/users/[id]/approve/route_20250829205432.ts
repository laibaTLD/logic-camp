// src/app/api/admin/users/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function verifyAdmin(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("Approve endpoint - Payload role:", payload.role);
  if (payload.role !== "admin") {
    console.log("Approve endpoint - Role mismatch, expected 'admin', got:", payload.role);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return payload;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await verifyAdmin(req);
  if (authResult instanceof NextResponse) return authResult;
  const payload = authResult;

  const { User } = await getModels();
  try {
    const user = await User.findByPk(params.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await user.update({ isApproved: true });
    return NextResponse.json({ message: "User approved", user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
