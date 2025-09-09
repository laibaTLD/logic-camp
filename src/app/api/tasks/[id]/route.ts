// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schema for updating tasks
const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'inProgress', 'testing', 'completed']).optional(),
  dueDate: z.string().optional(),
  assignedToId: z.number().optional(),
  goalId: z.number().min(1, 'Goal ID is required').optional(),
});

// --------------------
// GET /api/tasks/[id] - Get task by ID
// --------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Task, User, Goal } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await Task.findByPk(taskId, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: Goal, as: 'goal', attributes: ['id', 'title', 'status'] },
      ],
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error('Get task by ID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// PUT /api/tasks/[id] - Update task by ID
// --------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Task, User, Goal, Project } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = updateTaskSchema.parse(body);

    const task = await Task.findByPk(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Validate assigned user if provided
    let newAssignedId: number | null | undefined = undefined;
    if (validatedData.assignedToId !== undefined) {
      const assignee = validatedData.assignedToId ? await User.findByPk(validatedData.assignedToId) : null;
      if (validatedData.assignedToId && !assignee) {
        return NextResponse.json({ error: 'Assigned user not found' }, { status: 400 });
      }
      newAssignedId = validatedData.assignedToId ?? null;
    }

    // Validate deadline within project range if provided
    if (validatedData.dueDate) {
      const goal = await Goal.findByPk(task.goal_id);
      if (goal) {
        const project = await Project.findByPk(goal.project_id);
        if (project) {
          const due = new Date(validatedData.dueDate);
          if (project.start_date && due < new Date(project.start_date)) {
            return NextResponse.json({ error: 'Task deadline is before project start_date' }, { status: 422 });
          }
          if (project.end_date && due > new Date(project.end_date)) {
            return NextResponse.json({ error: 'Task deadline is after project end_date' }, { status: 422 });
          }
        }
      }
    }

    // Update task
    await task.update({
      title: validatedData.title ?? task.title,
      description: validatedData.description ?? task.description,
      status: validatedData.status ?? task.status,
      deadline: validatedData.dueDate ? new Date(validatedData.dueDate) : task.deadline,
      assigned_to_id: newAssignedId !== undefined ? newAssignedId : task.assigned_to_id,
      goal_id: validatedData.goalId ?? task.goal_id,
    });

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: Goal, as: 'goal', attributes: ['id', 'title', 'status'] },
      ],
    });

    return NextResponse.json(
      { message: 'Task updated successfully', task: updatedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update task by ID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}