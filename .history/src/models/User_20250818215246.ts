import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: "admin" | "member" | "viewer";
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public avatar?: string;
  public role!: "admin" | "member" | "viewer";
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initUser = (sequelize: Sequelize) => {
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      avatar: { type: DataTypes.STRING(500), allowNull: true },
      role: {
        type: DataTypes.ENUM("admin", "member", "viewer"),
        allowNull: false,
        defaultValue: "member",
      },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
