import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TaskAssigneeAttributes {
  id: number;
  taskId: number;
  userId: number;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAssigneeCreationAttributes extends Optional<TaskAssigneeAttributes, 'id' | 'createdAt' | 'updatedAt' | 'assignedAt'> {}

class TaskAssignee extends Model<TaskAssigneeAttributes, TaskAssigneeCreationAttributes> implements TaskAssigneeAttributes {
  public id!: number;
  public taskId!: number;
  public userId!: number;
  public assignedAt!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
  }
}

export const initTaskAssignee = (sequelize: Sequelize) => {
  TaskAssignee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assignedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
      tableName: 'task_assignees',
      timestamps: true,
      indexes: [
        {
          fields: ['taskId'],
        },
        {
          fields: ['userId'],
        },
        {
          unique: true,
          fields: ['taskId', 'userId'],
        },
      ],
    }
  );
};

export default TaskAssignee;