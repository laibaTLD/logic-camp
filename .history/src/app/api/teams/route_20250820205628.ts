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

    // Parse request body
    const body = await req.json();
    const parseResult = createTeamSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.issues }, { status: 400 });
    }

    const { name, description } = parseResult.data;

    // Validate payload.userId
    if (!payload.userId || typeof payload.userId !== 'number') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // ✅ Create team safely
    const team = await Team.create({
      name,
      description: description ? description : null, // ensure no undefined
      createdById: payload.userId,
    });

    // Fetch the created team with creator info
    const createdTeam = await Team.findByPk(team.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    return NextResponse.json({ message: 'Team created successfully', team: createdTeam }, { status: 201 });
  } catch (err) {
    console.error('Create team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
