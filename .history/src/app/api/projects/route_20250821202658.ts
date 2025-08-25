// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";

// ---------------------
// GET /api/projects (list all projects)
// ---------------------
export async function GET(req: NextRequest) {
  try {
    const { Project, User, Team, ProjectMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const projects = await Project.findAll({
      include: [
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: Team, as: "team", attributes: ["id", "name"] },
        {
          model: ProjectMember,
          as: "members",
          include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("Get projects error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// ---------------------
// POST /api/projects (create new project)
// ---------------------
export async function POST(req: NextRequest) {
  try {
    const { Project } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create projects" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, startDate, endDate, teamId } = body;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await Project.create({
      name,
      description,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      teamId: teamId || null,
      creatorId: payload.id, // the admin user creating this
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    console.error("Create project error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
