import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface ProjectAttributes {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  endDate?: Date;
  createdById: number;
  teamId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public status!: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public startDate?: Date;
  public endDate?: Date;
  public createdById!: number;
  public teamId?: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations will be set up after all models are initialized
  public static associate(models: any) {
    // This will be called after all models are loaded
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
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id',
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
      tableName: 'projects',
      timestamps: true,
      indexes: [
        {
          fields: ['status'],
        },
        {
          fields: ['priority'],
        },
        {
          fields: ['createdById'],
        },
        {
          fields: ['teamId'],
        },
      ],
    }
  );
};

export default Project;
