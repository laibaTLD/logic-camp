import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { getModels } from '@/lib/db';

// GET /api/user/contacts - list users available for individual chats (minimal fields)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;
    const currentUser = authResult;

    const { User } = await getModels();

    // Return minimal info for all active and approved users
    const contacts = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      where: {
        is_active: true,
        is_approved: true,
      },
      order: [['name', 'ASC']],
    });

    // Optionally filter out self on client; keep all here
    return NextResponse.json({ users: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
