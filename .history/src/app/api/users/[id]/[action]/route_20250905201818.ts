import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '../../../../../models';
import { logActivity } from '../../../../../middleware/activityLogger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface RouteParams {
  params: Promise<{
    id: string;
    action: string;
  }>;
}

// PUT /api/users/[id]/[action] - Perform user actions
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

    // Check permissions
    if (decoded.role !== 'admin' && decoded.role !== 'teamLead') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(resolvedParams.id);
    const action = resolvedParams.action;

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent users from modifying themselves (except admins can deactivate themselves)
    if (userId === decoded.userId && action !== 'deactivate') {
      return NextResponse.json({ error: 'Cannot perform this action on yourself' }, { status: 400 });
    }

    // Prevent non-admins from modifying admins
    if (decoded.role !== 'admin' && user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot modify admin users' }, { status: 403 });
    }

    let updateData: any = {};
    let activityAction = '';
    let activityMetadata: any = {};

    switch (action) {
      case 'activate':
        if (user.isActive) {
          return NextResponse.json({ error: 'User is already active' }, { status: 400 });
        }
        updateData = { isActive: true };
        activityAction = 'ACTIVATE';
        activityMetadata = { targetUserId: userId, targetUserName: user.name };
        break;

      case 'deactivate':
        if (!user.isActive) {
          return NextResponse.json({ error: 'User is already inactive' }, { status: 400 });
        }
        updateData = { isActive: false };
        activityAction = 'DEACTIVATE';
        activityMetadata = { targetUserId: userId, targetUserName: user.name };
        break;

      case 'approve':
        if (user.isApproved) {
          return NextResponse.json({ error: 'User is already approved' }, { status: 400 });
        }
        updateData = { isApproved: true };
        activityAction = 'APPROVE';
        activityMetadata = { targetUserId: userId, targetUserName: user.name };
        break;

      case 'reject':
        if (!user.isApproved) {
          return NextResponse.json({ error: 'User is already rejected' }, { status: 400 });
        }
        updateData = { isApproved: false, isActive: false };
        activityAction = 'REJECT';
        activityMetadata = { targetUserId: userId, targetUserName: user.name };
        break;

      case 'delete':
        // Only admins can delete users
        if (decoded.role !== 'admin') {
          return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 });
        }
        
        // Cannot delete yourself
        if (userId === decoded.userId) {
          return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        // Log activity before deletion
        await logActivity(request, {
          userId: decoded.userId,
          action: 'DELETE',
          resource: 'USER',
          resourceId: userId.toString(),
          metadata: { targetUserId: userId, targetUserName: user.name, targetUserEmail: user.email },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });

        await user.destroy();
        return NextResponse.json({ message: 'User deleted successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update the user
    await user.update(updateData);

    // Log activity
    await logActivity(request, {
      userId: decoded.userId,
      action: activityAction,
      resource: 'USER',
      resourceId: userId.toString(),
      metadata: activityMetadata,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return NextResponse.json({ 
      message: `User ${action}d successfully`,
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error(`Error ${resolvedParams.action}ing user:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}