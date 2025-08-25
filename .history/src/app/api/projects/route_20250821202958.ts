import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getModels } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "on-hold", "completed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  teamId: z.number().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Project, User, Team, ProjectMember } = await getModels();
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const project = await Project.findByPk(params.id, {
      include: [
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: Team, as: "team", attributes: ["id", "name"] },
        {
          model: ProjectMember,
          as: "members",
          include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
        },
      ],
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Project, Team } = await getModels();
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update projects" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    if (validatedData.teamId) {
      const teamExists = await Team.findByPk(validatedData.teamId);
      if (!teamExists) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const project = await Project.findByPk(params.id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await project.update({
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : project.startDate,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : project.endDate,
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("Update project error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Project } = await getModels();
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete projects" }, { status: 403 });
    }

    const project = await Project.findByPk(params.id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await project.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
