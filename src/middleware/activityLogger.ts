import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '../lib/auth';

interface ActivityLogOptions {
  action: string;
  resource: string;
  resourceId?: number;
  metadata?: object;
}

/**
 * Log user activity
 * @param request - Next.js request object
 * @param options - Activity logging options
 */
export async function logActivity(
  request: NextRequest,
  options: ActivityLogOptions
): Promise<void> {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return; // Skip logging if user is not authenticated
    }

    const { userId } = authResult.user;
    const actualUserId = userId;

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Persisting activity is disabled (no UserActivity model). This is a no-op.
    // You can plug in an external logger or DB writer here if needed.
  } catch (error) {
    // Log error but don't throw to avoid breaking the main request
    console.error('Error logging user activity:', error);
  }
}

/**
 * Activity logging middleware factory
 * @param action - The action being performed
 * @param resource - The resource being acted upon
 * @param getResourceId - Function to extract resource ID from request
 * @param getMetadata - Function to extract metadata from request
 */
export function createActivityLogger(
  action: string,
  resource: string,
  getResourceId?: (request: NextRequest) => number | undefined,
  getMetadata?: (request: NextRequest) => object | undefined
) {
  return async (request: NextRequest) => {
    const resourceId = getResourceId ? getResourceId(request) : undefined;
    const metadata = getMetadata ? getMetadata(request) : undefined;

    await logActivity(request, {
      action,
      resource,
      resourceId,
      metadata
    });
  };
}

/**
 * Common activity actions
 */
export const ActivityActions = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  
  // User management
  UPDATE_PROFILE: 'update_profile',
  CHANGE_PASSWORD: 'change_password',
  UPLOAD_AVATAR: 'upload_avatar',
  UPDATE_PREFERENCES: 'update_preferences',
  
  // Project management
  CREATE_PROJECT: 'create_project',
  UPDATE_PROJECT: 'update_project',
  DELETE_PROJECT: 'delete_project',
  VIEW_PROJECT: 'view_project',
  JOIN_PROJECT: 'join_project',
  LEAVE_PROJECT: 'leave_project',
  
  // Task management
  CREATE_TASK: 'create_task',
  UPDATE_TASK: 'update_task',
  DELETE_TASK: 'delete_task',
  ASSIGN_TASK: 'assign_task',
  COMPLETE_TASK: 'complete_task',
  VIEW_TASK: 'view_task',
  
  // Team management
  CREATE_TEAM: 'create_team',
  UPDATE_TEAM: 'update_team',
  DELETE_TEAM: 'delete_team',
  JOIN_TEAM: 'join_team',
  LEAVE_TEAM: 'leave_team',
  ASSIGN_TEAM_LEAD: 'assign_team_lead',
  
  // Communication
  SEND_MESSAGE: 'send_message',
  READ_MESSAGE: 'read_message',
  DELETE_MESSAGE: 'delete_message',
  
  // File management
  UPLOAD_FILE: 'upload_file',
  DOWNLOAD_FILE: 'download_file',
  DELETE_FILE: 'delete_file',
  SHARE_FILE: 'share_file',
  
  // Admin actions
  APPROVE_USER: 'approve_user',
  REJECT_USER: 'reject_user',
  DELETE_USER: 'delete_user',
  UPDATE_USER_ROLE: 'update_user_role'
} as const;

/**
 * Common resource types
 */
export const ResourceTypes = {
  USER: 'user',
  PROJECT: 'project',
  TASK: 'task',
  TEAM: 'team',
  MESSAGE: 'message',
  FILE: 'file',
  NOTIFICATION: 'notification',
  SYSTEM: 'system'
} as const;

/**
 * Helper function to extract resource ID from URL path
 * @param request - Next.js request object
 * @param pathSegment - The segment index where the ID is located (e.g., /api/projects/[id] -> segment 2)
 */
export function extractResourceIdFromPath(
  request: NextRequest,
  pathSegment: number
): number | undefined {
  const pathParts = new URL(request.url).pathname.split('/');
  const idString = pathParts[pathSegment];
  const id = parseInt(idString);
  return isNaN(id) ? undefined : id;
}

/**
 * Helper function to extract metadata from request body
 * @param request - Next.js request object
 */
export async function extractMetadataFromBody(
  request: NextRequest
): Promise<object | undefined> {
  try {
    const body = await request.clone().json();
    return {
      requestBody: body,
      method: request.method,
      url: request.url
    };
  } catch {
    return {
      method: request.method,
      url: request.url
    };
  }
}