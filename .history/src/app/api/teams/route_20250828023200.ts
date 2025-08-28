import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schema
const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

// -----------------
// POST: Create Team
// -----------------
export async function POST(req: NextRequest) {
  try {
    const { Team, User } = await getModels();

    // Authenticate user
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult as { userId: number; role: string };
    if (!payload || payload.role !== 'admin' || !payload.userId) {
      return NextResponse.json({ error: 'Only admins can create teams' }, { status: 403 });
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

    // Prepare team data
    const teamData = {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      createdById: payload.userId,
      isActive: true,
    };

    // Create team
    const team = await Team.create(teamData);

    // Fetch created team with creator info
    const createdTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return NextResponse.json(
      { message: 'Team created successfully', team: createdTeam },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Create team error:', err);

    if (err.name === 'SequelizeValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: err.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -----------------
// GET: Fetch Teams
// -----------------
export async function GET(req: NextRequest) {
  try {
    const { Team, User } = await getModels();

    // Optional: authenticate user
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    // Fetch all teams with their members
    const teams = await Team.findAll({
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return NextResponse.json({ teams }, { status: 200 });
  } catch (err) {
    console.error('Fetch teams error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
