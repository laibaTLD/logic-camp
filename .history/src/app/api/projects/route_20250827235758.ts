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
    // 1️⃣ Verify JWT and extract user
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role?: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // 2️⃣ Parse body
    const body = await req.json();
    const { name, description, status = "planning", priority = "medium", teamId } = body;

    if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 });

    const { Project } = await getModels();

    // 3️⃣ Create project with logged-in user as creator
    const newProject = await Project.create({
      name,
      description,
      status,
      priority,
      teamId,
      createdById: user.id, // ✅ set creator from JWT
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (err: any) {
    console.error("Error creating project:", err);
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 });
  }
}

