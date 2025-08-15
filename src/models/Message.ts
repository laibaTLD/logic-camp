import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';

interface MessageAttributes {
  id: number;
  content: string;
  type: 'text' | 'file' | 'image' | 'link' | 'system';
  senderId: number;
  teamId: number;
  projectId?: number;
  taskId?: number;
  replyToId?: number;
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: Date;
  deletedAt?: Date;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
    imageUrl?: string;
    linkUrl?: string;
    linkTitle?: string;
    linkDescription?: string;
    [key: string]: any;
  };
  reactions?: {
    [userId: string]: string; // userId -> emoji
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageCreationAttributes extends Omit<MessageAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isEdited' | 'isDeleted'> {
  isEdited?: boolean;
  isDeleted?: boolean;
  metadata?: MessageAttributes['metadata'];
  reactions?: MessageAttributes['reactions'];
}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public content!: string;
  public type!: 'text' | 'file' | 'image' | 'link' | 'system';
  public senderId!: number;
  public teamId!: number;
  public projectId?: number;
  public taskId?: number;
  public replyToId?: number;
  public isEdited!: boolean;
  public isDeleted!: boolean;
  public editedAt?: Date;
  public deletedAt?: Date;
  public metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
    imageUrl?: string;
    linkUrl?: string;
    linkTitle?: string;
    linkDescription?: string;
    [key: string]: any;
  };
  public reactions?: {
    [userId: string]: string;
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public addReaction(userId: number, emoji: string): void {
    if (!this.reactions) {
      this.reactions = {};
    }
    this.reactions[userId.toString()] = emoji;
  }

  public removeReaction(userId: number): void {
    if (this.reactions && this.reactions[userId.toString()]) {
      delete this.reactions[userId.toString()];
    }
  }

  public getReactionCount(emoji: string): number {
    if (!this.reactions) return 0;
    return Object.values(this.reactions).filter(e => e === emoji).length;
  }

  public getReactionUsers(emoji: string): number[] {
    if (!this.reactions) return [];
    return Object.entries(this.reactions)
      .filter(([_, e]) => e === emoji)
      .map(([userId, _]) => parseInt(userId));
  }

  public markAsEdited(): void {
    this.isEdited = true;
    this.editedAt = new Date();
  }

  public markAsDeleted(): void {
    this.isDeleted = true;
    this.deletedAt = new Date();
  }

  public isSystemMessage(): boolean {
    return this.type === 'system';
  }

  public isFileMessage(): boolean {
    return this.type === 'file';
  }

  public isImageMessage(): boolean {
    return this.type === 'image';
  }

  public isLinkMessage(): boolean {
    return this.type === 'link';
  }

  public toJSON(): any {
    const values = Object.assign({}, this.get());
    values.reactionCount = this.reactions ? Object.keys(this.reactions).length : 0;
    values.isSystemMessage = this.isSystemMessage();
    values.isFileMessage = this.isFileMessage();
    values.isImageMessage = this.isImageMessage();
    values.isLinkMessage = this.isLinkMessage();
    return values;
  }
}

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
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM('text', 'file', 'image', 'link', 'system'),
      allowNull: false,
      defaultValue: 'text',
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
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
    replyToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'messages',
        key: 'id',
      },
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    reactions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    hooks: {
      beforeValidate: (message: Message) => {
        if (!message.metadata) {
          message.metadata = {};
        }
        if (!message.reactions) {
          message.reactions = {};
        }
      },
    },
    indexes: [
      {
        fields: ['teamId'],
      },
      {
        fields: ['senderId'],
      },
      {
        fields: ['projectId'],
      },
      {
        fields: ['taskId'],
      },
      {
        fields: ['replyToId'],
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

export default Message;
