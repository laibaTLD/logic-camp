// src/models/index.ts
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

// Import initialization functions
import { initUser } from "./User";
import { initProject } from "./Project";
import { initTask } from "./Task";
import { initTeam } from "./Team";
import { initTeamMember } from "./TeamMember";
import { initMessage } from "./Message";
import { initNotification } from "./Notification";
import { initProjectMember } from "./ProjectMember";

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
  User.belongsToMany(Team, { through: TeamMember, foreignKey: "userId", as: "teams" });
  User.belongsToMany(Project, { through: ProjectMember, foreignKey: "userId", as: "projects" });

  // -------------------
  // Project associations
  // -------------------
  Project.belongsTo(User, { foreignKey: "createdById", as: "creator" });
  Project.belongsTo(Team, { foreignKey: "teamId", as: "team" });
  Project.hasMany(Task, { foreignKey: "projectId", as: "tasks" });
  Project.belongsToMany(User, { through: ProjectMember, foreignKey: "projectId", as: "members" });

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
  // Notification associations
  // -------------------
  Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

  console.log("Model associations set up successfully");
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
  ProjectMember,
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
  ProjectMember,
  Message,
  Notification,
  sequelize,
  initializeModels,
  setupAssociations,
};
