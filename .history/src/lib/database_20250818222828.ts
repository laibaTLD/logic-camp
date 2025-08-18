// src/models/User.ts
import { Model, DataTypes, Sequelize } from "sequelize";

export const initUser  = (sequelize: Sequelize) => {
  class User extends Model {
    public id!: number;
    public email!: string;
    // Add other fields as necessary
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      // Define other fields here
    },
    {
      sequelize,
      modelName: "User ",
      tableName: "users", // Specify the table name if different
    }
  );

  return User;
};
