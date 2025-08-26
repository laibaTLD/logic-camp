// src/app/api/admin/users/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { User } = await getModels();
  try {
    const user = await User.findByPk(params.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await user.update({ isApproved: false });
    return NextResponse.json({ message: "User rejected", user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
