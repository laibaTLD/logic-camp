import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { checkAdmin } from "@/middleware/checkAdmin";

export async function GET(req: NextRequest) {
  const authError = checkAdmin(req);
  if (authError) return authError; // ❌ not authorized

  try {
    const { User } = await getModels();
    const users = await User.findAll({
      order: [["id", "ASC"]],
      attributes: ["id", "name", "email", "role", "isActive", "isApproved"],
    });

    return NextResponse.json(users, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
