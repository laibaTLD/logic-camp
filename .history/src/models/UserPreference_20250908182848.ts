import { Model, DataTypes, Sequelize } from 'sequelize';

class UserPreference extends Model {
  public id!: number;
  public userId!: number;
  public preferenceKey!: string;
  public preferenceValue!: string | object;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export { UserPreference };

export const initUserPreference = (sequelize: Sequelize): void => {
  UserPreference.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      preferenceKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      preferenceValue: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'UserPreferences',
      timestamps: true,
    }
  );
};