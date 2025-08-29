import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface ProjectMessageAttributes {
  id: number;
  content: string;
  senderId: number;
  projectId: number;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMessageCreationAttributes extends Optional<ProjectMessageAttributes, 'id' | 'isEdited' | 'createdAt' | 'updatedAt'> {}

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
    }
  );
};

export default ProjectMessage;