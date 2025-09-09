import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface ProjectMemberAttributes {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ProjectMemberCreationAttributes extends Optional<ProjectMemberAttributes, 'id' | 'created_at' | 'updated_at'> {}

class ProjectMember extends Model<ProjectMemberAttributes, ProjectMemberCreationAttributes> implements ProjectMemberAttributes {
  public id!: number;
  public project_id!: number;
  public user_id!: number;
  public role!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

export function initProjectMember(sequelize: Sequelize): void {
  ProjectMember.init(
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'member',
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
      tableName: 'project_members',
      timestamps: true,
      underscored: true,
    }
  );
}

export default ProjectMember;