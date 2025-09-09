// src/app/api/admin/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// ----------------------
// Helper: Verify Admin
// ----------------------
async function checkAdmin(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (payload.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// ----------------------
// GET all projects (admin only)
// ----------------------
export async function GET(req: NextRequest) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const { Project, User, Team } = await getModels();
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ success: true, projects }, { status: 200 });
  } catch (err: any) {
    console.error("GET /admin/projects error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}