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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectCreationAttributes
  extends Optional<ProjectAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'startDate' | 'endDate' | 'teamId'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes {
  // Fields
  public id!: number;
  public name!: string;
  public description?: string;
  public status!: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public startDate?: Date;
  public endDate?: Date;
  public createdById!: number;
  public teamId?: number;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
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
    }
  );
};

export { Project };
export default Project;
