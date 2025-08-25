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
// Schema for updating roles
const updateMembersSchema = z.object({
  members: z.array(
    z.object({
      userId: z.number(),
      role: z.enum(['owner', 'admin', 'member', 'viewer']),
      isActive: z.boolean(),
    })
  ),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Team, TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as { userId: number; role: string };

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update members' }, { status: 403 });
    }

    const teamId = parseInt(params.id);
    const body = await req.json();
    const parsed = updateMembersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
    }

    // Update each member
    for (const member of parsed.data.members) {
      await TeamMember.update(
        { role: member.role, isActive: member.isActive },
        { where: { teamid: teamId, userid: member.userId } }
      );
    }

    return NextResponse.json({ message: 'Team members updated successfully' });
  } catch (err) {
    console.error('Update team members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE single member
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as { userId: number; role: string };

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 });
    }

    const teamId = parseInt(params.id);
    const body = await req.json();
    const { userId } = body;

    await TeamMember.destroy({ where: { teamid: teamId, userid: userId } });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove team member error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
