// src/app/api/teams/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// -------------------
// GET /api/teams/:id/members - Get all members of a team
// -------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { TeamMember, User } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const teamId = parseInt(resolvedParams.id);
    const members = await TeamMember.findAll({
      where: { teamId }, // camelCase
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    return NextResponse.json({ members });
  } catch (err) {
    console.error('Get team members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------
// PATCH /api/teams/:id/members - Update roles or active status
// -------------------
const updateMembersSchema = z.object({
  members: z.array(
    z.object({
      userId: z.number(),
      role: z.enum(['owner', 'admin', 'member', 'viewer']),
      isActive: z.boolean(),
    })
  ),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as { role: string };

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update members' }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
    const body = await req.json();
    const parsed = updateMembersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
    }

    for (const member of parsed.data.members) {
      await TeamMember.update(
        { role: member.role, isActive: member.isActive },
        { where: { teamId, userId: member.userId } } // camelCase
      );
    }

    return NextResponse.json({ message: 'Team members updated successfully' });
  } catch (err) {
    console.error('Update team members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------
// DELETE /api/teams/:id/members - Remove a member
// -------------------
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as { role: string };

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
    const body = await req.json();
    const { userId } = body;

    await TeamMember.destroy({
      where: { teamId, userId }, // ✅ camelCase fixes the error
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove team member error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
