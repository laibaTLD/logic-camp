import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getModels } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { User, Task } = await getModels();
    const user = await User.findByPk(authResult.user.userId, {
      include: [
        // Only include associations that are defined in model setup
        { model: Task, as: 'assignedTasks' },
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is approved (field is is_approved in the model)
    if (!user.is_approved) {
      return NextResponse.json({ error: 'Account pending approval. Please contact an administrator.' }, { status: 403 });
    }

    return NextResponse.json(user.get({ plain: true }));
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}