import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/lib/database";

class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: "admin" | "user";  // enum
  declare isActive: boolean;
  declare isApproved: boolean;     // new field
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      allowNull: false,
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false }, // default false
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

export default User;
