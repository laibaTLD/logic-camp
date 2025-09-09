import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TeamAttributes {
  id: number;
  name: string;
  description?: string | null;
  team_lead_id: number;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TeamCreationAttributes
  extends Optional<TeamAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description'> {}

class Team extends Model<TeamAttributes, TeamCreationAttributes>
  implements TeamAttributes {
  // Fields
  declare id: number;
  declare name: string;
  declare description?: string | null;
  declare team_lead_id: number;
  declare is_active: boolean;

  // timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }
}

export const initTeam = (sequelize: Sequelize) => {
  Team.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { len: [1, 100] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      team_lead_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
    },
    {
      sequelize,
      tableName: 'teams',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['name'], unique: true },
        { fields: ['is_active'] },
        { fields: ['team_lead_id'] },
      ],
    }
  );
};

export { Team };
export default Team;
