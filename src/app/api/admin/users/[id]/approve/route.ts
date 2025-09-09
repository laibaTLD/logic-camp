// src/app/api/admin/users/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("Approve endpoint - Payload role:", authResult.user.role);
  if (authResult.user.role !== "admin") {
    console.log("Approve endpoint - Role mismatch, expected 'admin', got:", authResult.user.role);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return authResult.user;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const authResult = await verifyAdmin(req);
  if (authResult instanceof NextResponse) return authResult;
  const payload = authResult;

  const { User } = await getModels();
  try {
    const user = await User.findByPk(resolvedParams.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await user.update({ is_approved: true });
    // Map to UI shape for immediate reflection
    const j = user.toJSON();
    const uiUser = { id: j.id, name: j.name, email: j.email, role: j.role, isApproved: true, isActive: j.is_active };
    return NextResponse.json({ message: "User approved", user: uiUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
