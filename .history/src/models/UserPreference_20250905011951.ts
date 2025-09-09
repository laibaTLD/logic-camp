import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../lib/database';

interface UserPreferenceAttributes {
  id: number;
  userId: number;
  theme: 'dark' | 'light' | 'auto';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserPreferenceCreationAttributes extends Optional<UserPreferenceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserPreference extends Model<UserPreferenceAttributes, UserPreferenceCreationAttributes> implements UserPreferenceAttributes {
  public id!: number;
  public userId!: number;
  public theme!: 'dark' | 'light' | 'auto';
  public language!: string;
  public emailNotifications!: boolean;
  public pushNotifications!: boolean;
  public soundEnabled!: boolean;
  public timezone!: string;
  public dateFormat!: string;
  public timeFormat!: '12h' | '24h';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

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
      unique: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    theme: {
      type: DataTypes.ENUM('dark', 'light', 'auto'),
      allowNull: false,
      defaultValue: 'dark',
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'en',
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    pushNotifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    soundEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'UTC',
    },
    dateFormat: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'MM/DD/YYYY',
    },
    timeFormat: {
      type: DataTypes.ENUM('12h', '24h'),
      allowNull: false,
      defaultValue: '12h',
    },
  },
  {
    sequelize,
    modelName: 'UserPreference',
    tableName: 'UserPreferences',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId'],
      },
    ],
  }
);

export { UserPreference, UserPreferenceAttributes, UserPreferenceCreationAttributes };