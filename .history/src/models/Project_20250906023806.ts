import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { notifyProjectCreated, notifyProjectUpdated } from '../services/notificationService';

export interface ProjectAttributes {
  id: number;
  name: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'testing' | 'completed' | 'archived';
  startDate?: Date;
  endDate?: Date;
  createdById: number;
  teamId: number;
  files?: object;
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
  declare status: 'todo' | 'inProgress' | 'testing' | 'completed' | 'archived';
  declare priority: 'low' | 'medium' | 'high' | 'urgent';
  declare startDate?: Date;
  declare endDate?: Date;
  declare createdById: number;
  declare teamId: number;
  declare files?: object;

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
        await notifyProjectCreated([this.createdById], this.name, this.id);
      } else if (action === 'updated') {
        await notifyProjectUpdated([this.createdById], this.name, this.status, this.id);
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
        type: DataTypes.ENUM('todo', 'inProgress', 'testing', 'completed', 'archived'),
        allowNull: false,
        defaultValue: 'todo',
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
      files: {
        type: DataTypes.JSON,
        allowNull: true,
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
