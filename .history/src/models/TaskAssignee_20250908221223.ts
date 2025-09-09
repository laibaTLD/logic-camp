import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// Attributes interface
export interface TaskAssigneeAttributes {
  id: number;
  taskId: number;
  userId: number;
  assignedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes: id, createdAt, updatedAt are optional
export interface TaskAssigneeCreationAttributes
  extends Optional<TaskAssigneeAttributes, "id" | "createdAt" | "updatedAt" | "assignedAt"> {}

// Model class
class TaskAssignee extends Model<TaskAssigneeAttributes, TaskAssigneeCreationAttributes>
  implements TaskAssigneeAttributes {
  // Declare fields so TS knows they exist
  declare id: number;
  declare taskId: number;
  declare userId: number;
  declare assignedAt: Date;

  // timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }
}

// Initialize the model
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
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assignedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TaskAssignee",
      tableName: "task_assignees",
      timestamps: true,
    }
  );

  return TaskAssignee;
};

export default TaskAssignee;