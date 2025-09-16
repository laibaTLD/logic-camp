import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

const updateSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  statusTitle: z.string().optional(),
  deadline: z.string().optional(),
  statuses: z.array(z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().optional(),
    color: z.string(),
  })).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  try {
    const { Goal } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const id = parseInt(resolved.id);
    const goal = await Goal.findByPk(id);
    if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });

    await goal.update({
      title: parsed.data.title ?? (goal as any).title,
      description: parsed.data.description ?? (goal as any).description,
      status_title: parsed.data.statusTitle ?? (goal as any).status_title,
      deadline: parsed.data.deadline ?? (goal as any).deadline,
      statuses: parsed.data.statuses ?? (goal as any).statuses,
    } as any);
    return NextResponse.json({ goal });
  } catch (err) {
    console.error('Update goal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  try {
    const { Goal } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const id = parseInt(resolved.id);
    const goal = await Goal.findByPk(id);
    if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

    await goal.destroy();
    return NextResponse.json({ message: 'Goal deleted' });
  } catch (err) {
    console.error('Delete goal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// GET /api/goals/[id] - Get goal by ID with project relation
// --------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  try {
    const { Goal, Project } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const id = parseInt(resolved.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const goal = await Goal.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'statuses'] },
      ] as any,
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ goal }, { status: 200 });
  } catch (err) {
    console.error('Get goal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

