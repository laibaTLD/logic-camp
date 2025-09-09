import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { notifyTaskAssigned, notifyTaskAssignedToTeam, notifyTaskCompleted } from '../services/notificationService';

export interface TaskAttributes {
  id: number;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: Date;
  goal_id: number;
  project_id: number;
  assigned_to?: number;
  created_by: number;
  estimated_hours?: number;
  actual_hours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'due_date' | 'assigned_to' | 'estimated_hours' | 'actual_hours'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  // Field declarations for TypeScript
  public id!: number;
  public title!: string;
  public description?: string;
  public status!: 'not_started' | 'in_progress' | 'completed';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public due_date?: Date;
  public goal_id!: number;
  public project_id!: number;
  public assigned_to?: number;
  public created_by!: number;
  public estimated_hours?: number;
  public actual_hours?: number;

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
      // Get the models to fetch assignees and project information
      const { getModels } = require('../lib/db');
      const models = await getModels();
      const { Project, Team, User, TeamMember, TaskAssignee } = models;
      
      // Check if there's an assignee
      const assigneeId = this.assigned_to;
      
      // Check if task has an assignee
      if (assigneeId) {
        // Fetch the goal to get project information
        const goal = await models.Goal.findByPk(this.goal_id);
        if (!goal) return;
        
        // Fetch the project with team and members
        const project = await Project.findByPk(goal.project_id, {
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
        
        if (project && project.team) {
          // Notify the assignee
          await notifyTaskAssigned(assigneeId, this.title, project.name, this.id);
        }
      }
      
      // Check if task was completed
      if (this.status === 'completed' && previousValues && previousValues.status !== 'completed') {
        if (assigneeId) {
          await notifyTaskCompleted([assigneeId], this.title, 'Project', this.id);
        }
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
        type: DataTypes.INTEGER.UNSIGNED,
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
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'not_started',
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      goal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'goals',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      estimated_hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      actual_hours: {
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
          fields: ['goal_id'],
        },
        {
          fields: ['project_id'],
        },
        {
          fields: ['assigned_to'],
        },
        {
          fields: ['deadline'],
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
