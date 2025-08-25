import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db"; // your Sequelize/Mongoose setup
import "dotenv/config";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { Task } = await getModels();
    const projectId = params.id;

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
    const projectId = params.id;
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // ✅ Create new task
    const newTask = await Task.create({
      title: body.title,
      description: body.description || "",
      status: body.status || "Pending",
      projectId,
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
