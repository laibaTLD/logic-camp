import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// ------------------
// Helper: Verify JWT
// ------------------
function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authentication required");
  }

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role?: string };
  } catch (err) {
    throw new Error("Invalid token");
  }
}

// ------------------
// GET Projects
// ------------------
export async function GET(req: NextRequest) {
  try {
    verifyToken(req); // just verify, no need to extract user for GET

    const { Project } = await getModels();
    const projects = await Project.findAll();

    return NextResponse.json(projects, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching projects:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch projects" }, { status: 500 });
  }
}

// ------------------
// POST Create Project
// ------------------
export async function POST(req: NextRequest) {
  try {
    const user = verifyToken(req); // Extract user info from JWT

    const body = await req.json();
    const { name, description, status = "planning", priority = "medium", teamId } = body;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const { Project } = await getModels();
    const newProject = await Project.create({
      name,
      description,
      status,
      priority,
      teamId,
      createdById: user.id, // set the logged-in user as creator
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (err: any) {
    console.error("Error creating project:", err);
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 });
  }
}
