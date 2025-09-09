// src/models/Notification.ts
import { DataTypes, Model, Sequelize } from 'sequelize';

export interface NotificationAttributes {
  id?: number;
  user_id: number;
  message: string;
  type: string;
  is_read: boolean;
  related_id?: number;
  related_type?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface NotificationCreationAttributes extends NotificationAttributes {}

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public user_id!: number;
  public message!: string;
  public type!: string;
  public is_read!: boolean;
  public related_id?: number;
  public related_type?: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initNotification(sequelize: Sequelize): void {
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      related_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      related_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'notifications',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}