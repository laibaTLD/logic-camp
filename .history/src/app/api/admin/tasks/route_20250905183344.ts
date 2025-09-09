// src/app/api/admin/tasks/route.ts
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
// GET all tasks (admin only)
// ----------------------
export async function GET(req: NextRequest) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const { Task, User, Project } = await getModels();
    const tasks = await Task.findAll({
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignees',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ success: true, tasks }, { status: 200 });
  } catch (err: any) {
    console.error("GET /admin/tasks error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
