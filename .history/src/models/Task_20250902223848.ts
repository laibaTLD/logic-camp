import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { notifyTaskAssigned, notifyTaskAssignedToTeam, notifyTaskCompleted } from '../services/notificationService';

export interface TaskAttributes {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  projectId: number;
  assignedToId?: number;
  createdById: number;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'dueDate' | 'assignedToId' | 'estimatedHours' | 'actualHours'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  // Field declarations for TypeScript
  public id!: number;
  public title!: string;
  public description?: string;
  public status!: 'todo' | 'in-progress' | 'review' | 'completed';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public dueDate?: Date;
  public projectId!: number;
  public assignedToId?: number;
  public createdById!: number;
  public estimatedHours?: number;
  public actualHours?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }

  // Instance methods for notification triggers
  async notifyTaskChanges(previousValues?: Partial<TaskAttributes>) {
    try {
      // Check if task was assigned to someone new
      if (this.assignedToId && (!previousValues || previousValues.assignedToId !== this.assignedToId)) {
        // Get the models to fetch project and team information
        const { getModels } = require('../lib/db');
        const models = await getModels();
        const { Project, Team, User, TeamMember } = models;
        
        // Fetch the project with team and members
        const project = await Project.findByPk(this.projectId, {
          include: [{
            model: Team,
            as: 'team',
            include: [{
              model: User,
              as: 'members',
              through: {
                model: TeamMember,
                attributes: ['role', 'joinedAt', 'isActive'],
                where: { isActive: true }
              },
              attributes: ['id', 'name', 'email']
            }]
          }]
        });
        
        if (project && project.team && project.team.members) {
          const teamMemberIds = project.team.members.map((member: any) => member.id);
          await notifyTaskAssignedToTeam(teamMemberIds, this.assignedToId, this.title, project.name, this.id);
        } else {
          // Fallback to single user notification if team info not available
          await notifyTaskAssigned(this.assignedToId, this.title, 'Project', this.id);
        }
      }
      
      // Check if task was completed
      if (this.status === 'completed' && previousValues && previousValues.status !== 'completed') {
        const userIds = this.assignedToId ? [this.createdById, this.assignedToId] : [this.createdById];
        await notifyTaskCompleted(userIds, this.title, 'Project', this.id);
      }
    } catch (error) {
      console.error(`Failed to send notification for task ${this.id}:`, error);
    }
  }
}

export const initTask = (sequelize: Sequelize) => {
  Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          len: [1, 200],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('todo', 'in-progress', 'review', 'completed'),
        allowNull: false,
        defaultValue: 'todo',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
      },
      assignedToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      createdById: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      estimatedHours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      actualHours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'tasks',
      timestamps: true,
      indexes: [
        {
          fields: ['status'],
        },
        {
          fields: ['priority'],
        },
        {
          fields: ['projectId'],
        },
        {
          fields: ['assignedToId'],
        },
        {
          fields: ['dueDate'],
        },
      ],
      hooks: {
        afterCreate: async (task: Task) => {
          await task.notifyTaskChanges();
        },
        afterUpdate: async (task: Task) => {
          if (task.changed()) {
            const previousValues = (task as any)._previousDataValues as Partial<TaskAttributes>;
            await task.notifyTaskChanges(previousValues);
          }
        },
      },
    }
  );
};

export default Task;
