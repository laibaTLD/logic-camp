// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/lib/database";
import User from "@/models/User";

export async function GET() {
  await sequelize.authenticate();
  const users = await User.findAll({ order: [["id", "ASC"]] });
  return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
  const { id } = await req.json();
  await sequelize.authenticate();
  await User.update({ isApproved: true }, { where: { id } });
  return NextResponse.json({ success: true });
}
