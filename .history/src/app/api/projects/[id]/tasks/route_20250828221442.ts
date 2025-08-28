import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";
import "dotenv/config";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { Task } = await getModels();
    const projectId = Number(params.id);

    // ✅ Find all tasks for this project
    const tasks = await Task.findAll({ where: { projectId } });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("GET tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { Task } = await getModels();
    const projectId = Number(params.id);
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // 👇 Add defaults for missing required fields
    const newTask = await Task.create({
      title: body.title,
      description: body.description || "",
      status: body.status || "Pending",
      priority: body.priority || "Medium",  // default priority
      projectId,
      createdById: body.createdById || 1,   // ⚡ ideally replace with logged-in user id
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("POST task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
