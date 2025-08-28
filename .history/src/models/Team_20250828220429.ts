import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TeamAttributes {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdById: number;
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
  declare isActive: boolean;
  declare createdById: number;

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
        validate: { len: [1, 100] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdById: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      tableName: 'teams',
      timestamps: true, // Sequelize auto-generates createdAt & updatedAt
      indexes: [
        { fields: ['isActive'] },
        { fields: ['createdById'] },
      ],
    }
  );
};

export { Team };
export default Team;
