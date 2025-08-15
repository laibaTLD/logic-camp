import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'myteamcamp_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password_here',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models
import User from './User';
import Project from './Project';
import Task from './Task';
import Team from './Team';
import TeamMember from './TeamMember';
import Notification from './Notification';
import Message from './Message';

// Define associations
User.hasMany(Project, { as: 'ownedProjects', foreignKey: 'ownerId' });
Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assignedToId' });
Task.belongsTo(User, { as: 'assignedTo', foreignKey: 'assignedToId' });

Project.hasMany(Task, { as: 'tasks', foreignKey: 'projectId' });
Task.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

User.belongsToMany(Team, { through: TeamMember, as: 'teams' });
Team.belongsToMany(User, { through: TeamMember, as: 'members' });

Project.belongsTo(Team, { as: 'team', foreignKey: 'teamId' });
Team.hasMany(Project, { as: 'projects', foreignKey: 'teamId' });

User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// Export models and sequelize instance
export {
  sequelize,
  User,
  Project,
  Task,
  Team,
  TeamMember,
  Notification,
  Message
};

export default sequelize;
