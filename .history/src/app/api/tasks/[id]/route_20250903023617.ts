// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schema for updating tasks
const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().optional(),
  assignedToId: z.number().optional(),
  estimatedHours: z.number().min(0).optional(),
  projectId: z.number().min(1, 'Project ID is required').optional(),
});

// --------------------
// GET /api/tasks/[id] - Get task by ID
// --------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Task, User, Project } = await getModels();

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
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'status'] },
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