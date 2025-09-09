// Direct database test script
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const dbConfig = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "myTeamCamp",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  dialect: "postgres",
};

console.log('Database config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
});

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: console.log,
  }
);

// Define a simple User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

async function testAdminUser() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    console.log('Looking for admin user...');
    const admin = await User.findOne({ where: { email: 'admin@example.com', role: 'admin' } });
    
    if (admin) {
      console.log('Admin user found:', admin.get({ plain: true }));
    } else {
      console.log('Admin user not found.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testAdminUser();