// src/app/api/admin/users/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function verifyAdmin(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (authResult.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return authResult.user;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const authResult = await verifyAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const { User } = await getModels();
  try {
    const user = await User.findByPk(resolvedParams.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await user.update({ is_approved: false });
    const j = user.toJSON();
    const uiUser = { id: j.id, name: j.name, email: j.email, role: j.role, isApproved: false, isActive: j.is_active };
    return NextResponse.json({ message: "User rejected", user: uiUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
