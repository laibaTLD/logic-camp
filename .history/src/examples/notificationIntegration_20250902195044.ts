// Example integration showing how to trigger notifications
// This demonstrates how to use the notification system when creating projects, assigning tasks, etc.

import { createNotification } from '@/services/notificationService';
import { NotificationType } from '../types/notifications';

// Example: When a project is created and assigned to a team
export async function handleProjectCreated(projectData: {
  id: number;
  name: string;
  description?: string;
  teamId: number;
  createdById: number;
}) {
  try {
    // Get all team members (this would come from your TeamMembers table)
    const teamMembers = await getTeamMembers(projectData.teamId);
    
    // Create notifications for all team members except the creator
    const notificationPromises = teamMembers
      .filter((member: { userId: number }) => member.userId !== projectData.createdById)
      .map((member: { userId: number }) =>
        createNotification({
          userId: member.userId,
          type: 'project_created',
          title: 'New Project Assigned',
          message: `A new project "${projectData.name}" has been assigned to your team.`,
          relatedEntityType: 'project',
          relatedEntityId: projectData.id
        })
      );
    
    await Promise.all(notificationPromises);
    console.log(`Created ${notificationPromises.length} project notifications`);
  } catch (error) {
    console.error('Failed to create project notifications:', error);
  }
}

// Example: When a task is assigned to a user
export async function handleTaskAssigned(taskData: {
  id: number;
  title: string;
  description?: string;
  assignedToId: number;
  projectId: number;
  assignedById: number;
}) {
  try {
    // Don't notify if user assigned task to themselves
    if (taskData.assignedToId === taskData.assignedById) {
      return;
    }
    
    // Get project name for context
    const project = await getProject(taskData.projectId);
    
    await createNotification({
      userId: taskData.assignedToId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: `You have been assigned a new task "${taskData.title}" in project "${project.name}".`,
      relatedEntityType: 'task',
      relatedEntityId: taskData.id
    });
    
    console.log(`Created task assignment notification for user ${taskData.assignedToId}`);
  } catch (error) {
    console.error('Failed to create task assignment notification:', error);
  }
}

// Example: When a task is completed
export async function handleTaskCompleted(taskData: {
  id: number;
  title: string;
  projectId: number;
  completedById: number;
  assignedToId?: number;
}) {
  try {
    const project = await getProject(taskData.projectId);
    // Project is already declared above, remove duplicate declaration
    const teamMembers = await getTeamMembers(project && typeof project === 'object' && 'teamId' in project ? project.teamId : 0);
    
    // Notify team members (except the one who completed it)
    const notificationPromises = teamMembers
      ?.filter((member: { userId: number }) => member.userId !== taskData.completedById)
      .map((member: { userId: number }) =>
        createNotification({
          userId: member.userId,
          type: NotificationType.TASK_COMPLETED,
          title: 'Task Completed',
          message: `Task "${taskData.title}" has been completed in project "${project.name}".`,
          relatedEntityType: 'task',
          relatedEntityId: taskData.id
        })
      );
    
    await Promise.all(notificationPromises);
    console.log(`Created ${notificationPromises.length} task completion notifications`);
  } catch (error) {
    console.error('Failed to create task completion notifications:', error);
  }
}

// Example: When there are unread chat messages
export async function handleUnreadChatMessages(chatData: {
  projectId: number;
  userId: number; // User who has unread messages
  unreadCount: number;
}) {
  try {
    const project = await getProject(chatData.projectId);
    
    // Check if there's already an unread chat notification for this user/project
    const existingNotification = await findExistingChatNotification(
      chatData.userId, 
      chatData.projectId
    );
    
    if (existingNotification !== null && existingNotification !== undefined) {
      // Update existing notification
      await updateNotification(existingNotification.id, {
        message: `You have ${chatData.unreadCount} unread messages in project "${project.name}" chat.`,
        isRead: false, // Reset to unread
        updatedAt: new Date()
      });
    } else {
      // Create new notification
      await createNotification({
        userId: chatData.userId,
        type: NotificationType.CHAT_UNREAD,
        title: 'Unread Messages',
        message: `You have ${chatData.unreadCount} unread messages in project "${project.name}" chat.`,
        relatedEntityType: 'project',
        relatedEntityId: chatData.projectId
      });
    }
    
    console.log(`Updated chat notification for user ${chatData.userId}`);
  } catch (error) {
    console.error('Failed to handle unread chat messages:', error);
  }
}

// Example: When a user is added to a team/project
export async function handleUserAddedToTeam(teamData: {
  teamId: number;
  userId: number;
  addedById: number;
  projectId?: number;
}) {
  try {
    const team = await getTeam(teamData.teamId);
    let message = `You have been added to team "${team.name}".`;
    
    if (teamData.projectId) {
      const project = await getProject(teamData.projectId);
      message = `You have been added to the team for project "${project.name}".`;
    }
    
    await createNotification({
      userId: teamData.userId,
      type: NotificationType.TEAM_ADDED,
      title: 'Added to Team',
      message,
      relatedEntityType: teamData.projectId ? 'project' : 'team',
      relatedEntityId: teamData.projectId || teamData.teamId
    });
    
    console.log(`Created team addition notification for user ${teamData.userId}`);
  } catch (error) {
    console.error('Failed to create team addition notification:', error);
  }
}

// Example: When a project is updated
export async function handleProjectUpdated(projectData: {
  id: number;
  name: string;
  teamId: number;
  updatedById: number;
  changes: string[]; // Array of what was changed
}) {
  try {
    const teamMembers = await getTeamMembers(projectData.teamId);
    const changesText = projectData.changes.join(', ');
    
    // Notify team members except the one who made the update
    const notificationPromises = teamMembers
      .filter(member => member.userId !== projectData.updatedById)
      .map(member => 
        createNotification({
          userId: member.userId,
          type: NotificationType.PROJECT_UPDATED,
          title: 'Project Updated',
          message: `Project "${projectData.name}" has been updated. Changes: ${changesText}`,
          relatedEntityType: 'project',
          relatedEntityId: projectData.id
        })
      );
    
    await Promise.all(notificationPromises);
    console.log(`Created ${notificationPromises.length} project update notifications`);
  } catch (error) {
    console.error('Failed to create project update notifications:', error);
  }
}

// Helper functions (these would be implemented based on your actual data models)
async function getTeamMembers(teamId: number) {
  // This would query your TeamMembers table
  // Return array of { userId: number, role?: string }
  throw new Error('Implement getTeamMembers based on your data model');
}

async function getProject(projectId: number) {
  // This would query your Projects table
  // Return { id: number, name: string, teamId: number }
  throw new Error('Implement getProject based on your data model');
}

async function getTeam(teamId: number) {
  // This would query your Teams table
  // Return { id: number, name: string }
  throw new Error('Implement getTeam based on your data model');
}

async function findExistingChatNotification(userId: number, projectId: number) {
  // This would query notifications table for existing unread chat notifications
  // Return notification or null
  throw new Error('Implement findExistingChatNotification based on your needs');
}

async function updateNotification(id: number, updates: Partial<{
  message: string;
  isRead: boolean;
  updatedAt: Date;
}>) {
  // This would update an existing notification
  throw new Error('Implement updateNotification based on your needs');
}

// Example usage in your API routes or service functions:
/*

// In your project creation API route:
app.post('/api/projects', async (req, res) => {
  try {
    const project = await createProject(req.body);
    
    // Trigger notifications
    await handleProjectCreated({
      id: project.id,
      name: project.name,
      description: project.description,
      teamId: project.teamId,
      createdById: req.user.id
    });
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In your task assignment API route:
app.post('/api/tasks', async (req, res) => {
  try {
    const task = await createTask(req.body);
    
    // Trigger notifications if task is assigned
    if (task.assignedToId) {
      await handleTaskAssigned({
        id: task.id,
        title: task.title,
        description: task.description,
        assignedToId: task.assignedToId,
        projectId: task.projectId,
        assignedById: req.user.id
      });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In your chat message API route:
app.post('/api/projects/:projectId/messages', async (req, res) => {
  try {
    const message = await createChatMessage({
      ...req.body,
      projectId: req.params.projectId,
      senderId: req.user.id
    });
    
    // Get team members and update their unread counts
    const teamMembers = await getTeamMembers(project.teamId);
    const otherMembers = teamMembers.filter(m => m.userId !== req.user.id);
    
    // Update unread notifications for each team member
    for (const member of otherMembers) {
      const unreadCount = await getUnreadMessageCount(member.userId, req.params.projectId);
      await handleUnreadChatMessages({
        projectId: parseInt(req.params.projectId),
        userId: member.userId,
        unreadCount
      });
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

*/