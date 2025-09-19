import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { sequelize } from '../lib/database';

interface MessageAttributes {
  id: number;
  content: string;
  senderId: number;
  receiverId?: number;
  chatType: 'individual' | 'group';
  chatId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'isRead' | 'createdAt' | 'updatedAt'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public content!: string;
  public senderId!: number;
  public receiverId?: number;
  public chatType!: 'individual' | 'group';
  public chatId!: string;
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize function
export const initMessage = (sequelizeInstance: Sequelize = sequelize) => {
  Message.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      chatType: {
        type: DataTypes.ENUM('individual', 'group'),
        allowNull: false,
        defaultValue: 'individual',
      },
      chatId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      sequelize: sequelizeInstance,
      modelName: 'Message',
      tableName: 'Messages',
      timestamps: true,
    }
  );
};

export default Message;
