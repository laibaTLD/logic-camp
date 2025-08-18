// src/lib/database.ts
import { Sequelize } from "sequelize"; 
import dotenv from "dotenv";
import { initUser }from "./models/User";

dotenv.config();

const dbConfig = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "myTeamCamp",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  dialect: "postgres" as const,
};

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectModule: require("pg"),
    logging: false,
  }
);

// ✅ Initialize models
export const User = UserModel(sequelize);

// ✅ Test connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    throw error;
  }
};

// ✅ Sync database
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log(
      process.env.NODE_ENV === "development"
        ? "✅ Database synced (development mode)."
        : "✅ Database synced."
    );
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    throw error;
  }
};

export default sequelize;
