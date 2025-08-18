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
  public id!: number;
  public content!: string;
  public senderId!: number;
  public teamId!: number;
  public isEdited!: boolean;
  public editedAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations will be set up after all models are initialized
  public static associate(models: any) {
    // This will be called after all models are loaded
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
