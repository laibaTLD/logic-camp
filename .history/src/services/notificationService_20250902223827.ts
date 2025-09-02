export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'project_created' | 'task_assigned' | 'chat_unread' | 'project_updated' | 'task_completed' | 'team_added';
  isRead: boolean;
  readAt?: Date;
  relatedEntityType?: 'project' | 'task' | 'chat' | 'team';
  relatedEntityId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

// Get notifications for a specific user
export const getNotifications = async (userId: number): Promise<NotificationResponse> => {
  const response = await fetch(`/api/notifications/user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
};

// Mark notification as read
export const markAsRead = async (notificationId: number): Promise<void> => {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
};

// Create a new notification
export const createNotification = async (notificationData: {
  userId: number;
  title: string;
  message: string;
  type: Notification['type'];
  relatedEntityType?: Notification['relatedEntityType'];
  relatedEntityId?: number;
}): Promise<Notification> => {
  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notificationData),
  });
  if (!response.ok) {
    throw new Error('Failed to create notification');
  }
  return response.json();
};

// Notification helper functions for different scenarios
export const notifyProjectCreated = async (userIds: number[], projectName: string, projectId: number): Promise<void> => {
  const notifications = userIds.map(userId => ({
    userId,
    title: 'New Project Assigned',
    message: `A new project "${projectName}" has been assigned to your team.`,
    type: 'project_created' as const,
    relatedEntityType: 'project' as const,
    relatedEntityId: projectId,
  }));

  await Promise.all(notifications.map(notification => createNotification(notification)));
};

export const notifyTaskAssigned = async (userId: number, taskName: string, projectName: string, taskId: number): Promise<void> => {
  await createNotification({
    userId,
    title: 'New Task Assigned',
    message: `You have been assigned a new task "${taskName}" in project "${projectName}".`,
    type: 'task_assigned',
    relatedEntityType: 'task',
    relatedEntityId: taskId,
  });
};

// Notify all team members when a task is assigned
export const notifyTaskAssignedToTeam = async (teamMemberIds: number[], assignedUserId: number, taskName: string, projectName: string, taskId: number): Promise<void> => {
  const notifications = teamMemberIds.map(userId => {
    const isAssignedUser = userId === assignedUserId;
    return {
      userId,
      title: isAssignedUser ? 'New Task Assigned' : 'New Team Task Created',
      message: isAssignedUser 
        ? `You have been assigned a new task "${taskName}" in project "${projectName}".`
        : `A new task "${taskName}" has been assigned to your team in project "${projectName}".`,
      type: 'task_assigned' as const,
      relatedEntityType: 'task' as const,
      relatedEntityId: taskId,
    };
  });

  await Promise.all(notifications.map(notification => createNotification(notification)));
};

export const notifyTaskCompleted = async (userIds: number[], taskName: string, projectName: string, taskId: number): Promise<void> => {
  const notifications = userIds.map(userId => ({
    userId,
    title: 'Task Completed',
    message: `Task "${taskName}" in project "${projectName}" has been completed.`,
    type: 'task_completed' as const,
    relatedEntityType: 'task' as const,
    relatedEntityId: taskId,
  }));

  await Promise.all(notifications.map(notification => createNotification(notification)));
};

export const notifyUnreadMessages = async (userId: number, messageCount: number, projectName: string, projectId: number): Promise<void> => {
  await createNotification({
    userId,
    title: 'Unread Messages',
    message: `You have ${messageCount} unread message${messageCount > 1 ? 's' : ''} in project "${projectName}" chat.`,
    type: 'chat_unread',
    relatedEntityType: 'project',
    relatedEntityId: projectId,
  });
};

export const notifyProjectUpdated = async (userIds: number[], projectName: string, updateType: string, projectId: number): Promise<void> => {
  const notifications = userIds.map(userId => ({
    userId,
    title: 'Project Updated',
    message: `Project "${projectName}" has been updated: ${updateType}.`,
    type: 'project_updated' as const,
    relatedEntityType: 'project' as const,
    relatedEntityId: projectId,
  }));

  await Promise.all(notifications.map(notification => createNotification(notification)));
};

export const notifyTeamAdded = async (userId: number, teamName: string, projectName: string, projectId: number): Promise<void> => {
  await createNotification({
    userId,
    title: 'Added to Team',
    message: `You have been added to team "${teamName}" for project "${projectName}".`,
    type: 'team_added',
    relatedEntityType: 'project',
    relatedEntityId: projectId,
  });
};