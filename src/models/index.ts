import { Sequelize } from "sequelize";
import { sequelize } from "../lib/database";

// Import spec-compliant model classes
import User from "./User";
import Project from "./Project";
import Goal from "./Goal";
import Task from "./Task";
import Team from "./Team";
import TeamMember from "./TeamMember";
import TaskComment from "./TaskComment";
import Message from "./Message";

// Type definitions for model associations
export interface ModelsInterface {
  User: typeof User;
  Project: typeof Project;
  Goal: typeof Goal;
  Task: typeof Task;
  Team: typeof Team;
  TaskComment: typeof TaskComment;
  TeamMember: typeof TeamMember;
  Message: typeof Message;
  sequelize: Sequelize;
}

// Import initialization functions
import { initUser } from "./User";
import { initProject } from "./Project";
import { initGoal } from "./Goal";
import { initTask } from "./Task";
import { initTeam } from "./Team";
import { initTeamMember } from "./TeamMember";
import { initTaskComment } from "./TaskComment";
import { initMessage } from "./Message";

/**
 * Initialize all models.
 * This must be called before setupAssociations().
 * @param sequelizeInstance Optional Sequelize instance (uses default if not provided)
 */
export const initializeModels = (sequelizeInstance: Sequelize = sequelize): void => {
  console.log("Initializing models...");

  // Initialize all models with sequelize instance
  initUser(sequelizeInstance);
  initProject(sequelizeInstance);
  initGoal(sequelizeInstance);
  initTask(sequelizeInstance);
  initTeam(sequelizeInstance);
  initTaskComment(sequelizeInstance);
  initTeamMember(sequelizeInstance);
  initMessage(sequelizeInstance);

  console.log("Models initialized successfully");
};

/**
 * Setup all associations between models.
 * Call this AFTER initializeModels().
 */
export const setupAssociations = () => {
  console.log("Setting up model associations...");

  // User associations
  User.hasMany(Task, { foreignKey: "assigned_to_id", as: "assignedTasks" });
  User.hasMany(TaskComment, { foreignKey: "user_id", as: "taskComments" });

  // Project associations
  Project.belongsTo(User, { foreignKey: "owner_id", as: "owner" });
  Project.belongsTo(Team, { foreignKey: "team_id", as: "team" });
  Project.hasMany(Goal, { foreignKey: "project_id", as: "goals" });

  // Goal associations
  Goal.belongsTo(Project, { foreignKey: "project_id", as: "project" });
  Goal.hasMany(Task, { foreignKey: "goal_id", as: "tasks" });

  // Task associations
  Task.belongsTo(User, { foreignKey: "assigned_to_id", as: "assignedTo" });
  Task.belongsTo(Goal, { foreignKey: "goal_id", as: "goal" });
  Task.hasMany(TaskComment, { foreignKey: "task_id", as: "comments" });

  // Team associations
  Team.belongsTo(User, { foreignKey: "team_lead_id", as: "teamLead" });
  Team.hasMany(Project, { foreignKey: "team_id", as: "projects" });
  // members via join table
  Team.belongsToMany(User, { through: TeamMember, foreignKey: "team_id", otherKey: "user_id", as: "members" });
  User.belongsToMany(Team, { through: TeamMember, foreignKey: "user_id", otherKey: "team_id", as: "teams" });

  // TaskComment associations
  TaskComment.belongsTo(Task, { foreignKey: "task_id", as: "task" });
  TaskComment.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // Message associations
  Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

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
  TeamMember,
  Message,
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
  TeamMember,
  Message,
  sequelize,
  initializeModels,
  setupAssociations,
};