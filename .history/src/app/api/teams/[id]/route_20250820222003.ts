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
// PATCH /api/teams/:id - Update team
// -------------------
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Team } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update teams' }, { status: 403 });
    }

    const teamId = parseInt(params.id);
    const team = await Team.findByPk(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const body = await req.json();
    const parsed = updateTeamSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });

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
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Team } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete teams' }, { status: 403 });
    }

    const teamId = parseInt(params.id);
    const team = await Team.findByPk(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

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
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Team, TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can assign members' }, { status: 403 });
    }

    const teamId = parseInt(params.id);
    const team = await Team.findByPk(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const body = await req.json();
    const parsed = assignMembersSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });

    const userIds = parsed.data.userIds;
    for (const userId of userIds) {
      await TeamMember.findOrCreate({
        where: { teamId, userId },
        defaults: { teamid, userid }, // ✅ use camelCas
      });
    }
    return NextResponse.json({ message: 'Members assigned successfully' });
  } catch (err) {
    console.error('Assign members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
