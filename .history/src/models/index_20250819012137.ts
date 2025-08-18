// src/models/index.ts
import { sequelize } from "../lib/database";
import User from "./User";
import Project from "./Project";
import Task from "./Task";
import Team from "./Team";
import TeamMember from "./TeamMember";
import Message from "./Message";
import Notification from "./Notification";

/**
 * Initialize all models.
 * Ensures models are ready before associations.
 */
export const initializeModels = () => {
  User.sync({ alter: true });
  Project.sync({ alter: true });
  Task.sync({ alter: true });
  Team.sync({ alter: true });
  TeamMember.sync({ alter: true });
  Message.sync({ alter: true });
  Notification.sync({ alter: true });
};

/**
 * Setup all associations between models.
 * Call this AFTER initializeModels().
 */
export const setupAssociations = () => {
  // -------------------
  // User associations
  // -------------------
  User.hasMany(Task, { foreignKey: "assignedToId", as: "assignedTasks" });
  User.hasMany(Task, { foreignKey: "createdById", as: "createdTasks" });
  User.hasMany(Project, { foreignKey: "createdById", as: "createdProjects" });
  User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
  User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
  User.belongsToMany(Team, { through: TeamMember, foreignKey: "userId", as: "teams" });

  // -------------------
  // Project associations
  // -------------------
  Project.belongsTo(User, { foreignKey: "createdById", as: "creator" });
  Project.belongsTo(Team, { foreignKey: "teamId", as: "team" });
  Project.hasMany(Task, { foreignKey: "projectId", as: "tasks" });

  // -------------------
  // Task associations
  // -------------------
  Task.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });
  Task.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
  Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });

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
  // Message associations
  // -------------------
  Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  Message.belongsTo(Team, { foreignKey: "teamId", as: "team" });

  // -------------------
  // Notification associations
  // -------------------
  Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
};

/**
 * Named exports for individual models and sequelize
 */
export {
  User,
  Project,
  Task,
  Team,
  TeamMember,
  Message,
  Notification,
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
  Message,
  Notification,
  sequelize,
  initializeModels,
  setupAssociations,
};
