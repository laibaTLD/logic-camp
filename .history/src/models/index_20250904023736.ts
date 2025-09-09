// src/models/index.ts
import { Sequelize } from "sequelize";
import { sequelize } from "../lib/database";

// Import model classes (not initialized yet)
import User from "./User";
import Project from "./Project";
import Task from "./Task";
import Team from "./Team";
import TeamMember from "./TeamMember";
import Message from "./Message";
import Notification from "./Notification";
import ProjectMember from "./ProjectMember";
import ProjectMessage from "./ProjectMessage";
import TaskAssignee from "./TaskAssignee";

// Type definitions for model associations
export interface ModelsInterface {
  User: typeof User;
  Project: typeof Project;
  Task: typeof Task;
  Team: typeof Team;
  TeamMember: typeof TeamMember;
  Message: typeof Message;
  Notification: typeof Notification;
  ProjectMember: typeof ProjectMember;
  ProjectMessage: typeof ProjectMessage;
  TaskAssignee: typeof TaskAssignee;
  sequelize: typeof sequelize;
}

// Import initialization functions
import { initUser } from "./User";
import { initProject } from "./Project";
import { initTask } from "./Task";
import { initTeam } from "./Team";
import { initTeamMember } from "./TeamMember";
import { initMessage } from "./Message";
import { initNotification } from "./Notification";
import { initProjectMember } from "./ProjectMember";
import { initProjectMessage } from "./ProjectMessage";
import { initTaskAssignee } from "./TaskAssignee";

/**
 * Initialize all models.
 * This must be called before setupAssociations().
 */
export const initializeModels = async () => {
  console.log("Initializing models...");

  // Initialize all models with sequelize instance
  initUser(sequelize);
  initProject(sequelize);
  initTask(sequelize);
  initTeam(sequelize);
  initTeamMember(sequelize);
  initMessage(sequelize);
  initNotification(sequelize);
  initProjectMember(sequelize);
  initProjectMessage(sequelize);
  initTaskAssignee(sequelize);

  console.log("Models initialized successfully");
};

/**
 * Setup all associations between models.
 * Call this AFTER initializeModels().
 */
export const setupAssociations = () => {
  console.log("Setting up model associations...");

  // -------------------
  // User associations
  // -------------------
  User.hasMany(Task, { foreignKey: "assignedToId", as: "assignedTasks" });
  User.hasMany(Task, { foreignKey: "createdById", as: "createdTasks" });
  User.hasMany(Project, { foreignKey: "createdById", as: "createdProjects" });
  User.hasMany(Team, { foreignKey: "createdById", as: "createdTeams" });
  User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
  User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
  User.hasMany(ProjectMessage, { foreignKey: "senderId", as: "sentProjectMessages" });
  User.belongsToMany(Team, { through: TeamMember, foreignKey: "userId", as: "teams" });
  User.belongsToMany(Project, { through: ProjectMember, foreignKey: "userId", as: "projects" });
  User.belongsToMany(Task, { through: TaskAssignee, foreignKey: "userId", as: "assignedToTasks" });

  // -------------------
  // Project associations
  // -------------------
  Project.belongsTo(User, { foreignKey: "createdById", as: "creator" });
  Project.belongsTo(Team, { foreignKey: "teamId", as: "team" });
  Project.hasMany(Task, { foreignKey: "projectId", as: "tasks" });
  Project.hasMany(ProjectMessage, { foreignKey: "projectId", as: "messages" });
  Project.belongsToMany(User, { through: ProjectMember, foreignKey: "projectId", as: "members" });

  // -------------------
  // Task associations
  // -------------------
  Task.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });
  Task.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
  Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });
  Task.belongsToMany(User, { through: TaskAssignee, foreignKey: "taskId", as: "assignees" });

  // -------------------
  // TaskAssignee associations
  // -------------------
  TaskAssignee.belongsTo(Task, { foreignKey: "taskId", as: "task" });
  TaskAssignee.belongsTo(User, { foreignKey: "userId", as: "user" });

  // -------------------
  // Team associations
  // -------------------
  Team.belongsTo(User, { foreignKey: "createdById", as: "creator" });
  Team.hasMany(Project, { foreignKey: "teamId", as: "projects" });
  Team.hasMany(Message, { foreignKey: "teamId", as: "messages" });
  Team.belongsToMany(User, { through: TeamMember, foreignKey: "teamId", as: "members" });

  // -------------------
  // TeamMember associations
  // -------------------
  TeamMember.belongsTo(User, { foreignKey: "userId", as: "user" });
  TeamMember.belongsTo(Team, { foreignKey: "teamId", as: "team" });

  // -------------------
  // ProjectMember associations
  // -------------------
  ProjectMember.belongsTo(User, { foreignKey: "userId", as: "user" });
  ProjectMember.belongsTo(Project, { foreignKey: "projectId", as: "project" });

  // -------------------
  // Message associations
  // -------------------
  Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  Message.belongsTo(Team, { foreignKey: "teamId", as: "team" });

  // -------------------
  // ProjectMessage associations
  // -------------------
  ProjectMessage.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  ProjectMessage.belongsTo(Project, { foreignKey: "projectId", as: "project" });

  // -------------------
  // Notification associations
  // -------------------
  Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

  console.log("Model associations set up successfully");
};

// Export individual models for direct import
export {
  User,
  Project,
  Task,
  Team,
  TeamMember,
  Message,
  Notification,
  ProjectMember,
  ProjectMessage,
  TaskAssignee,
  sequelize,
};

/**
 * Default export for convenience
 */
export default {
  User,
  Project,
  Task,
  Team,
  TeamMember,
  ProjectMember,
  Message,
  Notification,
  ProjectMessage,
  TaskAssignee,
  sequelize,
  initializeModels,
  setupAssociations,
};