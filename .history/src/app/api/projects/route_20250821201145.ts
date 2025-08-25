import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getModels } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  description: z.string().optional().default(""),
  status: z.enum(["planning", "active", "on-hold", "completed", "cancelled"]).default("planning"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  teamId: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { Project, User, Team, ProjectMember } = await getModels();
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const where: any = {};

    if (searchParams.get("status")) where.status = searchParams.get("status");
    if (searchParams.get("priority")) where.priority = searchParams.get("priority");
    if (searchParams.get("teamId")) where.teamId = parseInt(searchParams.get("teamId")!, 10);

    const projects = await Project.findAll({
      where,
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

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { Project, User, Team, ProjectMember } = await getModels();
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;
    if (!payload?.userId) return NextResponse.json({ error: "Invalid user payload" }, { status: 401 });
    if (payload.role !== "admin") return NextResponse.json({ error: "Only admins can create projects" }, { status: 403 });

    const body = await request.json();
    const { memberIds, ...projectData } = body;

    const validatedData = createProjectSchema.parse(projectData);

    if (validatedData.teamId) {
      const teamExists = await Team.findByPk(validatedData.teamId);
      if (!teamExists) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const project = await Project.create({
      ...validatedData,
      createdById: payload.userId,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
    });

    if (Array.isArray(memberIds) && memberIds.length > 0) {
      await Promise.all(memberIds.map((id: number) => ProjectMember.create({ projectId: project.id, userId: id })));
    }

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error: any) {
    console.error("Create project error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
