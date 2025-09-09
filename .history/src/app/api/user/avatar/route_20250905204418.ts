import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../../models/User';
import { verifyToken } from '../../../../lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface JWTPayload {
  userId: number;
  id: number;
  role: string;
  iat: number;
  exp: number;
}

// POST /api/user/avatar - Upload user avatar
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = authResult.user;
    const actualUserId = userId;

    // Get form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar_${actualUserId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update user's avatarUrl in database
    const avatarUrl = `/uploads/avatars/${fileName}`;
    await User.update(
      { avatarUrl },
      { where: { id: actualUserId } }
    );

    // Get updated user data
    const updatedUser = await User.findByPk(actualUserId, {
      attributes: ['id', 'name', 'email', 'role', 'avatarUrl']
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/avatar - Remove user avatar
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = authResult.user;
    const actualUserId = userId;

    // Update user's avatarUrl to null
    await User.update(
      { avatarUrl: null },
      { where: { id: actualUserId } }
    );

    // Get updated user data
    const updatedUser = await User.findByPk(actualUserId, {
      attributes: ['id', 'name', 'email', 'role', 'avatarUrl']
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error removing avatar:', error);
    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}