import { Model, DataTypes, Sequelize } from 'sequelize';

class UserActivity extends Model {
  public id!: number;
  public userId!: number;
  public action!: string;
  public resource!: string;
  public resourceId!: number | null;
  public metadata!: object | null;
  public ipAddress!: string;
  public userAgent!: string;
  public timestamp!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export { UserActivity };

export const initUserActivity = (sequelize: Sequelize): void => {
  UserActivity.init(
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
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resource: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'UserActivities',
      timestamps: true,
    }
  );
};