import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schema
const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name is too long'),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { Team, User } = await getModels();

    // Authenticate user
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    // Admin-only check
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create teams' },
        { status: 403 }
      );
    }

    // Parse request body safely
    const body = await req.json();
    const parsed = createTeamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Create team
    const team = await Team.create({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      createdById: payload.userId,
    });

    // Fetch created team with creator info
    const createdTeam = await Team.findOne({
      where: { id: team.id },
      include: [
        {
          model: User,
          as: 'creator', // make sure this association exists in Team model
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return NextResponse.json(
      { message: 'Team created successfully', team: createdTeam },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create team error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
