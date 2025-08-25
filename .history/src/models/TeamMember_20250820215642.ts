import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TeamMemberAttributes {
  id: number;
  userId: number;
  teamId: number;
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
  public userId!: number;
  public teamId!: number;
  public role!: 'owner' | 'admin' | 'member' | 'viewer';
  public joinedAt!: Date;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations will be set up after all models are initialized
  public static associate(models: any) {
    // called after all models are loaded
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
        field: 'userld', // maps to actual DB column
        references: {
          model: 'users',
          key: 'id',
        },
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'teamld', // maps to actual DB column
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
          fields: ['userId', 'teamId'], // still use camelCase in JS/TS
        },
        { fields: ['role'] },
        { fields: ['isActive'] },
      ],
    }
  );
};

export default TeamMember;
