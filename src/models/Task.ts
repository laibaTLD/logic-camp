import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

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

export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
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
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations will be set up after all models are initialized
  public static associate(models: any) {
    // This will be called after all models are loaded
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
    }
  );
};

export default Task;
