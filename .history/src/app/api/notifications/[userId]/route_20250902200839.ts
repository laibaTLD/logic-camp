import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';

// GET /api/notifications/[userId] - Get notifications for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');

    const whereClause: any = { userId };
    
    if (isRead !== null) {
      whereClause.isRead = isRead === 'true';
    }
    
    if (type) {
      whereClause.type = type;
    }

    const notifications = await (Notification as any).findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Also get unread count
    const unreadCount = await (Notification as any).count({
      where: {
        userId,
        isRead: false
      }
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}