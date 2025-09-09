import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface ProjectMessageAttributes {
  id: number;
  project_id: number;
  sender_id: number;
  message: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ProjectMessageCreationAttributes extends Optional<ProjectMessageAttributes, 'id' | 'created_at' | 'updated_at'> {}

class ProjectMessage extends Model<ProjectMessageAttributes, ProjectMessageCreationAttributes> implements ProjectMessageAttributes {
  public id!: number;
  public project_id!: number;
  public sender_id!: number;
  public message!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

export function initProjectMessage(sequelize: Sequelize): void {
  ProjectMessage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      tableName: 'project_messages',
      timestamps: true,
      underscored: true,
    }
  );
}

export default ProjectMessage;