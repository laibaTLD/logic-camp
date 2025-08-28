import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface MessageAttributes {
  id: number;
  content: string;
  senderId: number;
  teamId: number;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'isEdited' | 'createdAt' | 'updatedAt'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  // Field declarations for TypeScript
  public id!: number;
  public content!: string;
  public senderId!: number;
  public teamId!: number;
  public isEdited!: boolean;
  public editedAt?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }
}

export const initMessage = (sequelize: Sequelize) => {
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
        validate: {
          len: [1, 1000],
        },
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
      },
      isEdited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      editedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'messages',
      timestamps: true,
      indexes: [
        {
          fields: ['senderId'],
        },
        {
          fields: ['teamId'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
};

export default Message;
