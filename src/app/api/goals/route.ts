import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

const createSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().optional(),
  status: z.enum(['todo','inProgress','testing','completed']).optional(),
  projectId: z.number(),
  deadline: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { Goal, Project } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const where: any = {};
    if (projectId) where.project_id = parseInt(projectId);

    const goals = await Goal.findAll({ where, order: [['createdAt','DESC']], include: [{ model: Project, as: 'project' }] as any });
    return NextResponse.json({ goals });
  } catch (err) {
    console.error('Fetch goals error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { Goal } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
    }

    const goal = await Goal.create({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status ?? 'todo',
      project_id: parsed.data.projectId,
      deadline: parsed.data.deadline ?? null,
    } as any);

    return NextResponse.json({ goal }, { status: 201 });
  } catch (err) {
    console.error('Create goal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


