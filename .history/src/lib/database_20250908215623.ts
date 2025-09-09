// src/lib/database.ts
import { Sequelize } from "sequelize"; 
import dotenv from "dotenv";
// Import pg properly for Next.js compatibility
import pg from 'pg';

// Verify pg module is loaded
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

// Create Sequelize instance with proper configuration
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectModule: pg,
    logging: false, // Set to console.log for debugging, false for production
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      // For PostgreSQL connection stability
      statement_timeout: 30000,
      idle_in_transaction_session_timeout: 30000
    }
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
