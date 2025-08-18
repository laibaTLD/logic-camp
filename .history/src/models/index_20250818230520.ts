import { sequelize } from '../lib/database';

// Import models
import  User, {inituser }  from './User';
import  Project, {initProject } from './Project';
import  Task, {initTask } from './Task';
import  Team, {initTeam } from './Team';
import  TeamMember, {initTeamMember } from './TeamMember';
import  Message, {initMessage } from './Message';
import Notification, {initNotification } from './Notification';

// Initialize all models
export const initializeModels = () => {
  initUser (sequelize);
  initProject(sequelize);
  initTask(sequelize);
  initTeam(sequelize);
  initTeamMember(sequelize);
  initMessage(sequelize);
  initNotification(sequelize);
};

// Set up associations
export const setupAssociations = () => {
  // User associations
  User.hasMany(Task, { foreignKey: 'assignedToId', as: 'assignedTasks' });
  User.hasMany(Task, { foreignKey: 'createdById', as: 'createdTasks' });
  User.hasMany(Project, { foreignKey: 'createdById', as: 'createdProjects' });
  User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
  User.belongsToMany(Team, { through: TeamMember, foreignKey: 'userId', as: 'teams' });

  // Project associations
  Project.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
  Project.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });

  // Task associations
  Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });
  Task.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
  Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

  // Team associations
  Team.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
  Team.hasMany(Project, { foreignKey: 'teamId', as: 'projects' });
  Team.hasMany(Message, { foreignKey: 'teamId', as: 'messages' });
  Team.belongsToMany(User, { through: TeamMember, foreignKey: 'teamId', as: 'members' });

  // TeamMember associations
  TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

  // Message associations
  Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
  Message.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
};

// Export all models
export {
  User,
  Project,
  Task,
  Team,
  TeamMember,
  Message,
  Notification,
  sequelize
};

export default {
  User,
  Project,
  Task,
  Team,
  TeamMember,
  Message,
  Notification,
  sequelize
};
