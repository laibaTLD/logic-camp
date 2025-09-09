import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

const updateSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  status: z.enum(['todo','inProgress','testing','completed']).optional(),
  deadline: z.string().optional(),
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
      ...parsed.data,
      deadline: parsed.data.deadline ?? (goal as any).deadline,
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


