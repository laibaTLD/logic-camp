import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getModels } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { User, Project, Task, Notification } = await getModels();
    const user = await User.findByPk(authResult.user.userId, {
      include: [
        { model: Project, as: 'projects' },
        { model: Task, as: 'assignedTasks' },
        { model: Notification, as: 'notifications' }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return NextResponse.json({ error: 'Account pending approval. Please contact an administrator.' }, { status: 403 });
    }

    return NextResponse.json(user.get({ plain: true }));
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}