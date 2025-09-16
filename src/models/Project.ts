import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { notifyProjectCreated, notifyProjectUpdated } from '../services/notificationService';

export interface ProjectAttributes {
  id: number;
  name: string;
  description?: string;
  statuses?: Array<{
    id: number;
    title: string;
    description?: string;
    color: string;
  }> | null;
  status_title: string;
  start_date?: Date;
  end_date?: Date;
  team_id: number;
  owner_id: number;
  files?: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectCreationAttributes
  extends Optional<ProjectAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'start_date' | 'end_date' | 'files' | 'statuses' | 'status_title'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes {
  // Remove public class fields to avoid shadowing Sequelize getters/setters
  declare id: number;
  declare name: string;
  declare description?: string;
  declare statuses?: Array<{
    id: number;
    title: string;
    description?: string;
    color: string;
  }> | null;
  declare status_title: string;
  declare start_date?: Date;
  declare end_date?: Date;
  declare team_id: number;
  declare owner_id: number;
  declare files?: object | null;

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
        await notifyProjectCreated([this.owner_id], this.name, this.id);
      } else if (action === 'updated') {
        await notifyProjectUpdated([this.owner_id], this.name, this.status_title, this.id);
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
      statuses: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array of status objects with title, description, and color'
      },
      status_title: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'todo',
        comment: 'Current status title'
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      files: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'projects',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['name'] },
        { fields: ['status_title'] },
        { fields: ['team_id'] },
        { fields: ['owner_id'] },
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
