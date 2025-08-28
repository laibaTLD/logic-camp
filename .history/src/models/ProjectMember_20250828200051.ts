// File: src/lib/models/ProjectMember.ts
import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export interface ProjectMemberAttributes {
  id: number;
  projectId: number;
  userId: number;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMemberCreationAttributes
  extends Optional<ProjectMemberAttributes, "id" | "role" | "joinedAt" | "isActive" | "createdAt" | "updatedAt"> {}

class ProjectMember extends Model<ProjectMemberAttributes, ProjectMemberCreationAttributes>
  implements ProjectMemberAttributes {
  // Field declarations for TypeScript
  public id!: number;
  public projectId!: number;
  public userId!: number;
  public role!: "owner" | "admin" | "member";
  public joinedAt!: Date;
  public isActive!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }
}

export const initProjectMember = (sequelize: Sequelize) => {
  ProjectMember.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "projectid", // DB column
        references: { model: "projects", key: "id" },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "userid", // DB column
        references: { model: "users", key: "id" },
      },
      role: { type: DataTypes.ENUM("owner", "admin", "member"), allowNull: false, defaultValue: "member" },
      joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "isactive" },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: "project_members", timestamps: true }
  );
};

export default ProjectMember;
