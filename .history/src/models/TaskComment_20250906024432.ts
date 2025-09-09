import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TaskCommentAttributes {
  id: number;
  task_id: number;
  user_id: number;
  comment?: string;
  files?: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCommentCreationAttributes extends Optional<TaskCommentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'comment' | 'files'> {}

class TaskComment extends Model<TaskCommentAttributes, TaskCommentCreationAttributes> implements TaskCommentAttributes {
  // Field declarations for TypeScript
  public id!: number;
  public task_id!: number;
  public user_id!: number;
  public comment?: string;
  public files?: object;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }
}

export const initTaskComment = (sequelize: Sequelize) => {
  TaskComment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          customValidator(value: string | null) {
            if (value === null && this.files === null) {
              throw new Error('Either comment or files must be provided');
            }
          },
        },
      },
      files: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
          customValidator(value: object | null) {
            if (value === null && this.comment === null) {
              throw new Error('Either comment or files must be provided');
            }
          },
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
      tableName: 'task_comments',
      timestamps: true,
      indexes: [
        {
          fields: ['task_id'],
        },
        {
          fields: ['user_id'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
};

export default TaskComment;