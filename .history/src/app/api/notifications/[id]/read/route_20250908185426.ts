import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Notification } = await getModels();
    const resolvedParams = await params;
    const notificationId = parseInt(resolvedParams.id);
    
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    // Find the notification
    const notification = await Notification.findByPk(notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Update notification as read
    await notification.update({
      is_read: true,
      updated_at: new Date()
    });

    return NextResponse.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id]/read - Mark notification as unread (optional)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Notification } = await getModels();
    const resolvedParams = await params;
    const notificationId = parseInt(resolvedParams.id);
    
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    // Find the notification
    const notification = await Notification.findByPk(notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Update notification as unread
    await notification.update({
      isRead: false,
      readAt: undefined
    });

    return NextResponse.json({
      message: 'Notification marked as unread',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}