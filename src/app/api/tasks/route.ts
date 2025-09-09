// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'inProgress', 'testing', 'completed']).default('todo'),
  dueDate: z.string().nullable().optional(),
  assignedToId: z.number().nullable().optional(),
  goalId: z.number().min(1, 'Goal ID is required'),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.number().min(1, 'Task ID is required'),
});

// --------------------
// GET /api/tasks - Get all tasks for authenticated user, optionally filtered by goalId
// --------------------
export async function GET(req: NextRequest) {
  try {
    const { Task, User, Goal } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    // Get goalId from query parameters
    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get('goalId');

    // Build where clause
    const whereClause: any = {};
    if (goalId) {
      const goalIdNum = parseInt(goalId, 10);
      if (isNaN(goalIdNum)) {
        return NextResponse.json({ error: 'Invalid goalId parameter' }, { status: 400 });
      }
      whereClause.goal_id = goalIdNum;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: Goal, as: 'goal', attributes: ['id', 'title', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// POST /api/tasks - Create a new task
// --------------------
export async function POST(req: NextRequest) {
  try {
    const { Task, User, Goal } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    const body = await req.json();
    const validatedData = createTaskSchema.parse(body);

    // Verify goal exists
    const { Project } = await getModels();
    const goal = await Goal.findByPk(validatedData.goalId);
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Enforce: task deadline within project date range (if dates present)
    if (validatedData.dueDate) {
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

    // Verify assignee exists if provided
    const assigneeId = validatedData.assignedToId ?? null;
    if (assigneeId) {
      const assignee = await User.findByPk(assigneeId, { attributes: ['id'] });
      if (!assignee) {
        return NextResponse.json({ error: 'Assigned user not found' }, { status: 400 });
      }
    }

      const task = await Task.create({
        title: validatedData.title,
        description: validatedData.description ?? undefined,
        status: validatedData.status,
      deadline: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        goal_id: validatedData.goalId,
      assigned_to_id: assigneeId ?? undefined,
    });

    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: Goal, as: 'goal', attributes: ['id', 'title', 'status'] },
      ],
    });

    return NextResponse.json(
      { message: 'Task created successfully', task: createdTask },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// PATCH /api/tasks - Update a task
// --------------------
export async function PATCH(req: NextRequest) {
  try {
    const { Task, User, Goal } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    const body = await req.json();
    const validatedData = updateTaskSchema.parse(body);

    const task = await Task.findByPk(validatedData.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify assignee exists if provided
    let newAssignedId: number | null | undefined = undefined;
    if (validatedData.assignedToId !== undefined) {
      if (validatedData.assignedToId === null) {
        newAssignedId = null;
      } else {
        const assignee = await User.findByPk(validatedData.assignedToId, { attributes: ['id'] });
        if (!assignee) {
          return NextResponse.json({ error: 'Assigned user not found' }, { status: 400 });
        }
        newAssignedId = validatedData.assignedToId;
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

    // No multi-assignee support in schema; nothing else to update

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
    console.error('Update task error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// DELETE /api/tasks - Delete a task
// --------------------
export async function DELETE(req: NextRequest) {
  try {
    const { Task } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');

    if (!taskId || isNaN(parseInt(taskId))) {
      return NextResponse.json({ error: 'Valid task ID is required' }, { status: 400 });
    }

    const task = await Task.findByPk(parseInt(taskId));
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await task.destroy();

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
