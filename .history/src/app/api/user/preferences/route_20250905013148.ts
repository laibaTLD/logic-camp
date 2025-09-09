import { NextRequest, NextResponse } from 'next/server';
import { UserPreference } from '../../../../models/UserPreference';
import { verifyToken } from '../../../../lib/auth';

interface JWTPayload {
  userId: number;
  id: number;
  role: string;
  iat: number;
  exp: number;
}

// GET /api/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId, id } = token as JWTPayload;
    const actualUserId = userId || id;

    // Find or create user preferences
    let preferences = await UserPreference.findOne({
      where: { userId: actualUserId }
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await UserPreference.create({
        userId: actualUserId,
        theme: 'dark',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        theme: preferences.theme,
        language: preferences.language,
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        soundEnabled: preferences.soundEnabled,
        timezone: preferences.timezone,
        dateFormat: preferences.dateFormat,
        timeFormat: preferences.timeFormat
      }
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId, id } = token as JWTPayload;
    const actualUserId = userId || id;

    const body = await request.json();
    const {
      theme,
      language,
      emailNotifications,
      pushNotifications,
      soundEnabled,
      timezone,
      dateFormat,
      timeFormat
    } = body;

    // Validate theme
    if (theme && !['dark', 'light', 'auto'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme value' },
        { status: 400 }
      );
    }

    // Validate timeFormat
    if (timeFormat && !['12h', '24h'].includes(timeFormat)) {
      return NextResponse.json(
        { error: 'Invalid time format value' },
        { status: 400 }
      );
    }

    // Find or create preferences
    let preferences = await UserPreference.findOne({
      where: { userId: actualUserId }
    });

    if (!preferences) {
      // Create new preferences with provided values
      preferences = await UserPreference.create({
        userId: actualUserId,
        theme: theme || 'dark',
        language: language || 'en',
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
        soundEnabled: soundEnabled !== undefined ? soundEnabled : true,
        timezone: timezone || 'UTC',
        dateFormat: dateFormat || 'MM/DD/YYYY',
        timeFormat: timeFormat || '12h'
      });
    } else {
      // Update existing preferences
      const updateData: any = {};
      if (theme !== undefined) updateData.theme = theme;
      if (language !== undefined) updateData.language = language;
      if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
      if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;
      if (soundEnabled !== undefined) updateData.soundEnabled = soundEnabled;
      if (timezone !== undefined) updateData.timezone = timezone;
      if (dateFormat !== undefined) updateData.dateFormat = dateFormat;
      if (timeFormat !== undefined) updateData.timeFormat = timeFormat;

      await preferences.update(updateData);
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: {
        theme: preferences.theme,
        language: preferences.language,
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        soundEnabled: preferences.soundEnabled,
        timezone: preferences.timezone,
        dateFormat: preferences.dateFormat,
        timeFormat: preferences.timeFormat
      }
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}