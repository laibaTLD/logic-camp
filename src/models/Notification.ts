import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';

interface NotificationAttributes {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'project' | 'team' | 'system';
  category: 'task' | 'project' | 'team' | 'system' | 'general';
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    entityType?: string;
    entityId?: number;
    senderId?: number;
    projectId?: number;
    taskId?: number;
    teamId?: number;
    [key: string]: any;
  };
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationCreationAttributes extends Omit<NotificationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'isArchived'> {
  isRead?: boolean;
  isArchived?: boolean;
  metadata?: NotificationAttributes['metadata'];
}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public message!: string;
  public type!: 'info' | 'success' | 'warning' | 'error' | 'task' | 'project' | 'team' | 'system';
  public category!: 'task' | 'project' | 'team' | 'system' | 'general';
  public isRead!: boolean;
  public isArchived!: boolean;
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public actionUrl?: string;
  public actionText?: string;
  public metadata?: {
    entityType?: string;
    entityId?: number;
    senderId?: number;
    projectId?: number;
    taskId?: number;
    teamId?: number;
    [key: string]: any;
  };
  public expiresAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  public markAsRead(): void {
    this.isRead = true;
  }

  public markAsArchived(): void {
    this.isArchived = true;
  }

  public getPriorityColor(): string {
    switch (this.priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  }

  public getTypeIcon(): string {
    switch (this.type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'task': return '📋';
      case 'project': return '📁';
      case 'team': return '👥';
      case 'system': return '⚙️';
      default: return 'ℹ️';
    }
  }

  public toJSON(): any {
    const values = Object.assign({}, this.get());
    values.isExpired = this.isExpired();
    values.priorityColor = this.getPriorityColor();
    values.typeIcon = this.getTypeIcon();
    return values;
  }
}

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
        notEmpty: true,
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'task', 'project', 'team', 'system'),
      allowNull: false,
      defaultValue: 'info',
    },
    category: {
      type: DataTypes.ENUM('task', 'project', 'team', 'system', 'general'),
      allowNull: false,
      defaultValue: 'general',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    actionUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    actionText: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [1, 100],
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    hooks: {
      beforeValidate: (notification: Notification) => {
        if (!notification.metadata) {
          notification.metadata = {};
        }
      },
    },
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['isRead'],
      },
      {
        fields: ['isArchived'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
);

export default Notification;
