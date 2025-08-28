// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authentication required");
  }

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid token");
  }
}

// ---------------------
// GET: fetch all projects
// ---------------------
export async function GET(req: NextRequest) {
  try {
    await verifyToken(req);

    const { Project } = await getModels();
    const projects = await Project.findAll();

    return NextResponse.json(projects, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching projects:", err.message);
    const status = err.message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// ---------------------
// POST: create new project
// ---------------------
export async function POST(req: NextRequest) {
  try {
    await verifyToken(req);

    const body = await req.json();
    if (!body.name || !body.description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
    }

    const { Project } = await getModels();
    const newProject = await Project.create({
      name: body.name,
      description: body.description,
      // add more fields if needed
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (err: any) {
    console.error("Error creating project:", err.message);
    const status = err.message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: "Failed to create project" }, { status });
  }
}
