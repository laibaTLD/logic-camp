import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";
import "dotenv/config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Task } = await getModels();
    const resolvedParams = await params;
    const projectId = Number(resolvedParams.id);

    // ✅ Find all tasks for this project
    const tasks = await Task.findAll({ where: { project_id: projectId } });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Task, User, Project } = await getModels();
    
    // Authenticate user
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;
    
    const resolvedParams = await params;
    const projectId = Number(resolvedParams.id);
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Create task with proper associations
    const newTask = await Task.create({
      title: body.title,
      description: body.description || "",
      status: body.status || "todo",
      priority: body.priority || "medium",
      project_id: projectId,
      created_by: payload.userId,
      assigned_to: body.assignedToId || null,
      due_date: body.dueDate ? new Date(body.dueDate) : undefined,
      estimated_hours: body.estimatedHours || null,
    });

    // Fetch created task with associations
    const createdTask = await Task.findByPk(newTask.id, {
      include: [
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
        { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
        { model: Project, as: "project", attributes: ["id", "name", "status"] },
      ],
    });

    return NextResponse.json(createdTask, { status: 201 });
  } catch (error) {
    console.error("POST task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Task, User, Project } = await getModels();
    
    // Authenticate user
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const resolvedParams = await params;
    const projectId = Number(resolvedParams.id);
    const body = await req.json();
    const { taskId, ...updateData } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Find task
    const task = await Task.findOne({
      where: { id: taskId, projectId }
    });
    
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Update task
    await task.update(updateData);

    // Fetch updated task with associations
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
        { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
        { model: Project, as: "project", attributes: ["id", "name", "status"] },
      ],
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("PATCH task error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
