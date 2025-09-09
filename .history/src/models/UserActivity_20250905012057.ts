import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../lib/database';

interface UserActivityAttributes {
  id: number;
  userId: number;
  action: string;
  resource: string;
  resourceId?: number;
  metadata?: object;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserActivityCreationAttributes extends Optional<UserActivityAttributes, 'id' | 'resourceId' | 'metadata' | 'ipAddress' | 'userAgent' | 'createdAt' | 'updatedAt'> {}

class UserActivity extends Model<UserActivityAttributes, UserActivityCreationAttributes> implements UserActivityAttributes {
  public id!: number;
  public userId!: number;
  public action!: string;
  public resource!: string;
  public resourceId?: number;
  public metadata?: object;
  public ipAddress?: string;
  public userAgent?: string;
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserActivity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Action performed (e.g., login, create_project, update_task)',
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Resource type (e.g., user, project, task, team)',
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the resource being acted upon',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional context data for the activity',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP address of the user',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent string',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'UserActivity',
    tableName: 'UserActivities',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['action'],
      },
      {
        fields: ['resource'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['userId', 'timestamp'],
      },
    ],
  }
);

export { UserActivity, UserActivityAttributes, UserActivityCreationAttributes };