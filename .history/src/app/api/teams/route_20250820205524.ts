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

    // Authenticate user
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    // Admin-only
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create teams' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const parsedData = createTeamSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsedData.error.issues }, { status: 400 });
    }

    const { name, description } = parsedData.data;

    // Create team
    const team = await Team.create({
      name,
      description: description ?? null,
      createdById: payload.userId,
    });

    // Fetch team with creator info
    const createdTeam = await Team.findByPk(team.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
    });

    return NextResponse.json({ message: 'Team created successfully', team: createdTeam }, { status: 201 });
  } catch (err) {
    console.error('Create team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
