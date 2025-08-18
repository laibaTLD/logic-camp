import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface NotificationAttributes {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  readAt?: Date;
  relatedEntityType?: 'task' | 'project' | 'team' | 'message';
  relatedEntityId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'isRead' | 'createdAt' | 'updatedAt'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public message!: string;
  public type!: 'info' | 'success' | 'warning' | 'error';
  public isRead!: boolean;
  public readAt?: Date;
  public relatedEntityType?: 'task' | 'project' | 'team' | 'message';
  public relatedEntityId?: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations will be set up after all models are initialized
  public static associate(models: any) {
    // This will be called after all models are loaded
  }
}

export const initNotification = (sequelize: Sequelize) => {
  Notification.init(
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
          model: 'users',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          len: [1, 200],
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 500],
        },
      },
      type: {
        type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
        allowNull: false,
        defaultValue: 'info',
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      relatedEntityType: {
        type: DataTypes.ENUM('task', 'project', 'team', 'message'),
        allowNull: true,
      },
      relatedEntityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      tableName: 'notifications',
      timestamps: true,
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['isRead'],
        },
        {
          fields: ['type'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
};

export default Notification;
