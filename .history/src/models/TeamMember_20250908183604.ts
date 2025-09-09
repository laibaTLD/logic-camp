import { Model, DataTypes, Sequelize } from 'sequelize';

class TeamMember extends Model {
  public id!: number;
  public team_id!: number;
  public user_id!: number;
  public role!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
          model: 'Teams',
          key: 'id',
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
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
      tableName: 'TeamMembers',
      timestamps: true,
    }
  );
};