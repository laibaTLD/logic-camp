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
  teamId: z.string().optional(), // in MongoDB, IDs are strings (ObjectId)
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

    const { id } = params;

    const body = await req.json();
    const parsedData = updateProjectSchema.parse(body);

    const validatedData: any = { ...parsedData };

    // Convert date strings to JS Date objects
    if (validatedData.startDate)
      validatedData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate)
      validatedData.endDate = new Date(validatedData.endDate);

    const updatedProject = await Project.findByIdAndUpdate(id, validatedData, {
      new: true,
    })
      .populate("creator", "id name email")
      .populate("team", "id name")
      .populate({
        path: "members",
        populate: { path: "user", select: "id name email" },
      });

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

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

    const { id } = params;

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err: any) {
    console.error("Delete project error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
