import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '../../../lib/auth';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'completed']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().datetime().optional(),
  projectId: z.number({ error: 'Project ID is required' }),
  assignedToId: z.number().optional(),
  estimatedHours: z.number().min(0).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

// GET /api/tasks - Get all tasks
export async function GET(request: NextRequest) {
  try {
    const { Task, User, Project } = await getModels();
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = authResult;
    const { searchParams } = new URL(request.url);
    
    // Build query options
    const where: any = {};
    const include: any[] = [
      { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
      { model: Project, as: 'project', attributes: ['id', 'name', 'status'] }
    ];

    // Filter by status
    if (searchParams.get('status')) {
      where.status = searchParams.get('status');
    }

    // Filter by priority
    if (searchParams.get('priority')) {
      where.priority = searchParams.get('priority');
    }

    // Filter by project
    if (searchParams.get('projectId')) {
      where.projectId = parseInt(searchParams.get('projectId')!);
    }

    // Filter by assigned user
    if (searchParams.get('assignedToId')) {
      where.assignedToId = parseInt(searchParams.get('assignedToId')!);
    }

    const tasks = await Task.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = authResult;
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Create task
    const task = await Task.create({
      ...validatedData,
      createdById: payload.userId,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    });

    // Fetch task with associations
    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'status'] }
      ]
    });

    return NextResponse.json(
      { message: 'Task created successfully', task: createdTask },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
