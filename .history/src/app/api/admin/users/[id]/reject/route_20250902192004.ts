// src/app/api/admin/users/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function verifyAdmin(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload || payload.role !== "admin") {
    return null;
  }
  return payload;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { User } = await getModels();
  try {
    const user = await User.findByPk(resolvedParams.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await user.update({ isApproved: false });
    return NextResponse.json({ message: "User rejected", user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
