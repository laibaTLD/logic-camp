import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TeamMemberAttributes {
  id: number;
  userId: number;   // maps to DB column "userid"
  teamId: number;   // maps to DB column "teamid"
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMemberCreationAttributes
  extends Optional<TeamMemberAttributes, 'id' | 'joinedAt' | 'createdAt' | 'updatedAt'> {}

class TeamMember
  extends Model<TeamMemberAttributes, TeamMemberCreationAttributes>
  implements TeamMemberAttributes
{
  public id!: number;
  public userId!: number;   // ✅ keep camelCase in code
  public teamId!: number;   // ✅ keep camelCase in code
  public role!: 'owner' | 'admin' | 'member' | 'viewer';
  public joinedAt!: Date;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    // define associations later
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
        field: 'userid',   // ✅ actual DB column
        references: {
          model: 'users',
          key: 'id',
        },
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'teamid',   // ✅ actual DB column
        references: {
          model: 'teams',
          key: 'id',
        },
      },
      role: {
        type: DataTypes.ENUM('owner', 'admin', 'member', 'viewer'),
        allowNull: false,
        defaultValue: 'member',
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
      tableName: 'team_members',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['userid', 'teamid'], // ✅ use actual DB column names here
        },
        { fields: ['role'] },
        { fields: ['isActive'] },
      ],
    }
  );
};

export default TeamMember;
