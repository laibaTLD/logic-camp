import { NextRequest, NextResponse } from 'next/server';
import { UserActivity } from '../../../../models/UserActivity';
import { verifyToken } from '../../../../lib/auth';
import { Op } from 'sequelize';

interface JWTPayload {
  userId: number;
  id: number;
  role: string;
  iat: number;
  exp: number;
}

// GET /api/user/activity - Get user activity history
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId, id } = authResult.user as JWTPayload;
    const actualUserId = userId || id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      userId: actualUserId
    };

    if (action) {
      whereClause.action = {
        [Op.iLike]: `%${action}%`
      };
    }

    if (resource) {
      whereClause.resource = resource;
    }

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) {
        whereClause.timestamp[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.timestamp[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows: activities } = await UserActivity.findAndCountAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit,
      offset,
      attributes: [
        'id',
        'action',
        'resource',
        'resourceId',
        'metadata',
        'timestamp'
      ]
    });

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      success: true,
      activities,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity history' },
      { status: 500 }
    );
  }
}

// POST /api/user/activity - Log user activity
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId, id } = authResult.user as JWTPayload;
    const actualUserId = userId || id;

    const body = await request.json();
    const { action, resource, resourceId, metadata } = body;

    // Validate required fields
    if (!action || !resource) {
      return NextResponse.json(
        { error: 'Action and resource are required' },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create activity record
    const activity = await UserActivity.create({
      userId: actualUserId,
      action,
      resource,
      resourceId: resourceId || null,
      metadata: metadata || null,
      ipAddress,
      userAgent,
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully',
      activityId: activity.id
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}