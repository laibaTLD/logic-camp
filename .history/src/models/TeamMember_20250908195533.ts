import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface TeamMemberAttributes {
  id: number;
  team_id: number;
  user_id: number;
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

interface TeamMemberCreationAttributes extends Optional<TeamMemberAttributes, 'id' | 'created_at' | 'updated_at'> {}

class TeamMember extends Model<TeamMemberAttributes, TeamMemberCreationAttributes> implements TeamMemberAttributes {
  public id!: number;
  public team_id!: number;
  public user_id!: number;
  public role!: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export { TeamMember };

export const initTeamMember = (sequelize: Sequelize): void => {
  TeamMember.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'member',
      },
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