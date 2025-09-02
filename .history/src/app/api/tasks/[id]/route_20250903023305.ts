// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

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