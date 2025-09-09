const { Sequelize } = require('sequelize');
const pg = require('pg');
require('dotenv').config();

// Database configuration - using PostgreSQL like the main app
const dbConfig = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "myTeamCamp",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  dialect: "postgres",
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectModule: pg,
    logging: false,
  }
);

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Query users table directly (PostgreSQL uses lowercase column names)
    const [results] = await sequelize.query('SELECT id, name, email, role, "isActive", "isApproved" FROM users ORDER BY id');
    
    console.log('Users in database:', results.length);
    if (results.length > 0) {
      console.log('User details:');
      results.forEach(user => {
        console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}, Approved: ${user.isApproved}`);
      });
    } else {
      console.log('No users found in database.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();