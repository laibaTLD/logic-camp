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
  public id!: number;
  public userId!: number;   // camelCase
  public teamId!: number;   // camelCase
  public role!: "owner" | "admin" | "member" | "viewer";
  public joinedAt!: Date;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static associate(models: any) {
    // Define associations here if needed, e.g.,
    // TeamMember.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    // TeamMember.belongsTo(models.Team, { foreignKey: "teamId", as: "team" });
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
