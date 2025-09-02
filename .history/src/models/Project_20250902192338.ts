import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { notifyProjectCreated, notifyProjectUpdated } from '../services/notificationService';

export interface ProjectAttributes {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  endDate?: Date;
  createdById: number;
  teamId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectCreationAttributes
  extends Optional<ProjectAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'startDate' | 'endDate'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes {
  // Remove public class fields to avoid shadowing Sequelize getters/setters
  declare id: number;
  declare name: string;
  declare description?: string;
  declare status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  declare priority: 'low' | 'medium' | 'high' | 'urgent';
  declare startDate?: Date;
  declare endDate?: Date;
  declare createdById: number;
  declare teamId: number;

  // timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }

  // Instance methods for notification triggers
  async notifyTeamMembers(action: 'created' | 'updated') {
    try {
      if (action === 'created') {
        await notifyProjectCreated([this.id], this.createdById, this.teamId);
      } else if (action === 'updated') {
        await notifyProjectUpdated(this.id, this.createdById, this.teamId);
      }
    } catch (error) {
      console.error(`Failed to send ${action} notification for project ${this.id}:`, error);
    }
  }
}

export const initProject = (sequelize: Sequelize) => {
  Project.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
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
        type: DataTypes.ENUM('planning', 'active', 'on-hold', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'planning',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdById: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      tableName: 'projects',
      timestamps: true, // Sequelize auto-generates createdAt & updatedAt
      indexes: [
        { fields: ['status'] },
        { fields: ['priority'] },
        { fields: ['createdById'] },
        { fields: ['teamId'] },
      ],
      hooks: {
        afterCreate: async (project: Project) => {
          await project.notifyTeamMembers('created');
        },
        afterUpdate: async (project: Project) => {
          if (project.changed()) {
            await project.notifyTeamMembers('updated');
          }
        },
      },
    }
  );
};

export { Project };
export default Project;
