import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getModels } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";

// ---------------------
// Validation schema
// ---------------------
const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z
    .enum(["planning", "active", "on-hold", "completed", "cancelled"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid startDate format",
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid endDate format",
    }),
  teamId: z.number().optional(),
});

// ---------------------
// PATCH /api/projects/:id
// ---------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { Project, User, Team, ProjectMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;

    // Admin-only check
    if (payload.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update projects" },
        { status: 403 }
      );
    }

    const projectId = parseInt(params.id, 10);
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsedData = updateProjectSchema.parse(body);

    const validatedData: any = { ...parsedData };

    // Convert dates
    if (validatedData.startDate)
      validatedData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate)
      validatedData.endDate = new Date(validatedData.endDate);

    // Update project
    await project.update(validatedData);

    // Refetch with associations
    const updatedProject = await Project.findByPk(projectId, {
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

    return NextResponse.json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (err: any) {
    console.error("Update project error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------
// DELETE /api/projects/:id
// ---------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { Project } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;

    if (payload.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete projects" },
        { status: 403 }
      );
    }

    const projectId = parseInt(params.id, 10);
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await project.destroy(); // Sequelize instance method

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err: any) {
    console.error("Delete project error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
