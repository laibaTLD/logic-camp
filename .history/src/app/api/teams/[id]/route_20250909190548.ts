import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

const assignMembersSchema = z.object({
  userIds: z.array(z.number()).min(1),
});

// -------------------
// GET /api/teams/:id - Get team by ID
// -------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { Team } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const teamId = parseInt(resolvedParams.id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // Fetch team
    const team = await Team.findByPk(teamId);

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ team }, { status: 200 });
  } catch (err) {
    console.error('Fetch team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------
// PATCH /api/teams/:id - Update team
// -------------------
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { Team } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update teams' }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
    const team = await Team.findByPk(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const body = await req.json();
    const parsed = updateTeamSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });

    // Check if team name already exists (excluding current team)
    if (parsed.data.name) {
      const existingTeam = await Team.findOne({ 
        where: { 
          name: parsed.data.name,
          id: { [require('sequelize').Op.ne]: teamId }
        } 
      });
      if (existingTeam) {
        return NextResponse.json(
          { error: 'A team with this name already exists. Please choose a different name.' },
          { status: 409 }
        );
      }
    }

    await team.update(parsed.data as any);
    return NextResponse.json({ message: 'Team updated successfully', team });
  } catch (err) {
    console.error('Update team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------
// DELETE /api/teams/:id - Delete team
// -------------------
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { Team } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete teams' }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    const team = await Team.findByPk(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    // Permanently delete team when not using is_active column
    await team.destroy();
    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Delete team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------
// POST /api/teams/:id/assign - Assign members to team
// -------------------
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { Team } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    // Membership is not supported in current schema
    return NextResponse.json({ error: 'Team membership is not supported' }, { status: 410 });
  } catch (err) {
    console.error('Assign members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
