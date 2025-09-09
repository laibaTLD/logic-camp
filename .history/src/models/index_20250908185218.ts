// src/models/index.ts
import { Sequelize } from "sequelize";
import { sequelize } from "../lib/database";

// Import model classes (not initialized yet)
import { User } from "./User";
import { Project } from "./Project";
import { Goal } from "./Goal";
import { Task } from "./Task";
import { Team } from "./Team";
import { TaskComment } from "./TaskComment";
import { UserActivity } from "./UserActivity";
import { UserPreference } from "./UserPreference";
import { TeamMember } from "./TeamMember";
import { Notification } from "./Notification";

// Type definitions for model associations
export interface ModelsInterface {
  User: typeof User;
  Project: typeof Project;
  Goal: typeof Goal;
  Task: typeof Task;
  Team: typeof Team;
  TaskComment: typeof TaskComment;
  UserActivity: typeof UserActivity;
  UserPreference: typeof UserPreference;
  TeamMember: typeof TeamMember;
  Notification: typeof Notification;
  sequelize: Sequelize;
}

// Import initialization functions
import { initUser } from "./User";
import { initProject } from "./Project";
import { initGoal } from "./Goal";
import { initTask } from "./Task";
import { initTeam } from "./Team";
import { initTaskComment } from "./TaskComment";
import { initUserActivity } from "./UserActivity";
import { initUserPreference } from "./UserPreference";
import { initTeamMember } from "./TeamMember";
import { initNotification } from "./Notification";

/**
 * Initialize all models.
 * This must be called before setupAssociations().
 */
export const initializeModels = async (): Promise<void> => {
  console.log("Initializing models...");

  // Initialize all models with sequelize instance
  initUser(sequelize);
  initProject(sequelize);
  initGoal(sequelize);
  initTask(sequelize);
  initTeam(sequelize);
  initTaskComment(sequelize);
  initUserActivity(sequelize);
  initUserPreference(sequelize);
  initTeamMember(sequelize);
  initNotification(sequelize);

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
  User.hasMany(Task, { foreignKey: "assigned_to_id", as: "assignedTasks" });
  User.hasMany(Task, { foreignKey: "created_by_id", as: "createdTasks" });
  User.hasMany(Project, { foreignKey: "created_by_id", as: "createdProjects" });
  User.hasMany(Team, { foreignKey: "created_by_id", as: "createdTeams" });
  User.hasMany(TaskComment, { foreignKey: "user_id", as: "taskComments" });
  // -------------------
  // Project associations
  // -------------------
  Project.belongsTo(User, { foreignKey: "created_by_id", as: "creator" });
  Project.belongsTo(Team, { foreignKey: "team_id", as: "team" });
  Project.hasMany(Goal, { foreignKey: "project_id", as: "goals" });
  
  // -------------------
  // Goal associations
  // -------------------
  Goal.belongsTo(Project, { foreignKey: "project_id", as: "project" });
  Goal.hasMany(Task, { foreignKey: "goal_id", as: "tasks" });

  // -------------------
  // Task associations
  // -------------------
  Task.belongsTo(User, { foreignKey: "assigned_to_id", as: "assignedTo" });
  Task.belongsTo(User, { foreignKey: "created_by_id", as: "createdBy" });
  Task.belongsTo(Goal, { foreignKey: "goal_id", as: "goal" });
  Task.hasMany(TaskComment, { foreignKey: "task_id", as: "comments" });

  // -------------------
  // Team associations
  // -------------------
  Team.belongsTo(User, { foreignKey: "created_by_id", as: "creator" });
  Team.hasMany(Project, { foreignKey: "team_id", as: "projects" });
  Team.belongsToMany(User, { through: TeamMember, foreignKey: "team_id", as: "members" });
  User.belongsToMany(Team, { through: TeamMember, foreignKey: "user_id", as: "teams" });
  
  // -------------------
  // TaskComment associations
  // -------------------
  TaskComment.belongsTo(Task, { foreignKey: "task_id", as: "task" });
  TaskComment.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // -------------------
  // UserActivity associations
  // -------------------
  UserActivity.belongsTo(User, { foreignKey: "userId", as: "user" });

  // -------------------
  // UserPreference associations
  // -------------------
  UserPreference.belongsTo(User, { foreignKey: "userId", as: "user" });
  
  // -------------------
  // Notification associations
  // -------------------
  Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });

  console.log("Model associations set up successfully");
};

// Export individual models for direct import
export {
  User,
  Project,
  Goal,
  Task,
  Team,
  TaskComment,
  UserActivity,
  UserPreference,
  TeamMember,
  sequelize,
};

/**
 * Default export for convenience
 */
export default {
  User,
  Project,
  Goal,
  Task,
  Team,
  TaskComment,
  UserActivity,
  UserPreference,
  TeamMember,
  sequelize,
  initializeModels,
  setupAssociations,
};