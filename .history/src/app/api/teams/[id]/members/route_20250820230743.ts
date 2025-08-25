import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';
import { z } from 'zod';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Team, TeamMember, User } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as { userId: number; role: string };

    const teamId = parseInt(params.id);
    const team = await Team.findByPk(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    // Fetch members
    const members = await TeamMember.findAll({
      where: { teamid: teamId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    return NextResponse.json({ members });
  } catch (err) {
    console.error('Get team members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
