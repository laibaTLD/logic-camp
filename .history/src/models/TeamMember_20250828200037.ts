import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export interface TeamMemberAttributes {
  id: number;
  userId: number;
  teamId: number;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMemberCreationAttributes
  extends Optional<TeamMemberAttributes, "id" | "joinedAt" | "createdAt" | "updatedAt"> {}

class TeamMember
  extends Model<TeamMemberAttributes, TeamMemberCreationAttributes>
  implements TeamMemberAttributes
{
  // Field declarations for TypeScript
  public id!: number;
  public userId!: number;
  public teamId!: number;
  public role!: "owner" | "admin" | "member" | "viewer";
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

export const initTeamMember = (sequelize: Sequelize) => {
  TeamMember.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "userid", // maps to DB column
        references: { model: "users", key: "id" },
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "teamid", // maps to DB column
        references: { model: "teams", key: "id" },
      },
      role: {
        type: DataTypes.ENUM("owner", "admin", "member", "viewer"),
        allowNull: false,
        defaultValue: "member",
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "isactive",
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
      tableName: "team_members",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["userid", "teamid"] }, // DB column names
        { fields: ["role"] },
        { fields: ["isactive"] },
      ],
    }
  );
};

export default TeamMember;
