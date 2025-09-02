import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { notifyUnreadMessages } from '../services/notificationService';

export interface ProjectMessageAttributes {
  id: number;
  content: string;
  senderId: number;
  projectId: number;
  attachmentUrl?: string;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMessageCreationAttributes extends Optional<ProjectMessageAttributes, 'id' | 'isEdited' | 'attachmentUrl' | 'createdAt' | 'updatedAt'> {}

class ProjectMessage extends Model<ProjectMessageAttributes, ProjectMessageCreationAttributes> implements ProjectMessageAttributes {
  public id!: number;
  public content!: string;
  public senderId!: number;
  public projectId!: number;
  public isEdited!: boolean;
  public editedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    // Associations will be set up in index.ts
  }

  // Instance methods for notification triggers
  async notifyProjectMembers() {
    try {
      await notifyUnreadMessages(this.projectId, this.senderId);
    } catch (error) {
      console.error(`Failed to send chat notification for project ${this.projectId}:`, error);
    }
  }
}

export const initProjectMessage = (sequelize: Sequelize) => {
  ProjectMessage.init(
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
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
      },
      attachmentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: 'project_messages',
      timestamps: true,
      indexes: [
        { fields: ['senderId'] },
        { fields: ['projectId'] },
        { fields: ['createdAt'] },
      ],
      hooks: {
        afterCreate: async (message: ProjectMessage) => {
          await message.notifyProjectMembers();
        },
      },
    }
  );
};

export default ProjectMessage;