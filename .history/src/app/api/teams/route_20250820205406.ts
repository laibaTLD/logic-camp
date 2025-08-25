import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schema
const createTeamSchema = z.object({
  name: z.string().min(1).max(100, 'Team name must be less than 100 characters'),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { Team, User } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;

    // ✅ Admin-only
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create teams' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createTeamSchema.parse(body);

    // Create team
    const team = await Team.create({
      ...validatedData,
      createdById: payload.userId,
    });

    // Include creator info
    const createdTeam = await Team.findByPk(team.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    return NextResponse.json({ message: 'Team created successfully', team: createdTeam }, { status: 201 });
  } catch (err: any) {
    console.error('Create team error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
