
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import User from './User'; // import User for association

export interface TeamAttributes {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamCreationAttributes extends Optional<TeamAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description'> {}

class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: number;
  public name!: string;
  public description?: string | null;
  public isActive!: boolean;
  public createdById!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Association helper
  public static associate(models: any) {
    Team.belongsTo(models.User, { foreignKey: 'createdById', as: 'creator' });
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
      tableName: 'teams',
      timestamps: true,
      indexes: [
        { fields: ['isActive'] },
        { fields: ['createdById'] },
      ],
    }
  );
};

export default Team;
