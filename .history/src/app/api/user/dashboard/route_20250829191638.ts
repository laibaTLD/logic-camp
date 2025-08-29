import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getModels } from '@/lib/db';

export async function GET(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { User, Project, Task, Notification } = await getModels();
    const user = await User.findByPk(payload.userId, {
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

    return NextResponse.json(user.get({ plain: true }));
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}