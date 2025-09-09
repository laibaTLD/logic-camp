// src/lib/database.ts
import { Sequelize } from "sequelize"; 
import dotenv from "dotenv";
// Ensure pg is properly imported
const pg = require('pg');

console.log('PostgreSQL module loaded:', !!pg);

dotenv.config();

const dbConfig = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "myTeamCamp",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  dialect: "postgres" as const,
};

console.log('Creating Sequelize instance with config:', {
  database: dbConfig.database,
  username: dbConfig.username,
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  dialectModule: !!pg
});

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectModule: pg,
    logging: console.log,
  }
);

// ✅ Test connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    throw error;
  }
};

// ✅ Sync database
export const syncDatabase = async (): Promise<void> => {
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
