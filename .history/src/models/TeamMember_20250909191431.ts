import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TeamMemberAttributes {
  id: number;
  team_id: number;
  user_id: number;
  role?: string | null;
  is_active?: boolean;
  joined_at?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TeamMemberCreationAttributes
  extends Optional<TeamMemberAttributes, 'id' | 'createdAt' | 'updatedAt' | 'role' | 'is_active' | 'joined_at'> {}

class TeamMember extends Model<TeamMemberAttributes, TeamMemberCreationAttributes>
  implements TeamMemberAttributes {
  declare id: number;
  declare team_id: number;
  declare user_id: number;
  declare role?: string | null;
  declare is_active?: boolean;
  declare joined_at?: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export const initTeamMember = (sequelize: Sequelize) => {
  TeamMember.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      team_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      role: { type: DataTypes.STRING(50), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      joined_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      tableName: 'team_members',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['team_id'] },
        { fields: ['user_id'] },
      ],
    }
  );
};

export { TeamMember };
export default TeamMember;


