import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "@/lib/database";

// Define TypeScript types for User attributes
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

// Some fields are optional when creating a new user
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "role" | "isActive"> {}

// Define the User model class
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: string;
  public isActive!: boolean;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: "member" },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: true,
  }
);
