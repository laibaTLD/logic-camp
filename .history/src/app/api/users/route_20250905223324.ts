import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';
import { getModels } from '../../../lib/db';
import { logActivity } from '../../../middleware/activityLogger';

// GET /api/users - Get all users (admin/teamLead only)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    const decoded = payload as { userId: number; role: string };

    // Check if user has permission to view all users
    if (decoded.role !== 'admin' && decoded.role !== 'teamLead') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { User } = await getModels();
    const users = await User.findAll({
      attributes: {
        exclude: ['password']
      },
      order: [['createdAt', 'DESC']]
    });

    // Log activity
    await logActivity(request, {
      action: 'VIEW',
      resource: 'USERS',
      metadata: { count: users.length }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    const decoded = payload as { userId: number; role: string };

    // Only admins can create users
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { User } = await getModels();
    const { name, email, password, role = 'employee' } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'teamLead', 'employee'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the model hook
      role,
      isActive: true,
      isApproved: true // Admin-created users are auto-approved
    });

    // Log activity
    await logActivity(request, {
      action: 'CREATE',
      resource: 'USER',
      resourceId: user.id,
      metadata: { name, email, role }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}