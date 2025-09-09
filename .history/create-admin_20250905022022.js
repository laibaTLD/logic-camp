const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'logic_camp',
  process.env.DB_USER || 'postgres', 
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function createAdminUser() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    const [results, metadata] = await sequelize.query(
      `INSERT INTO users (name, email, password, role, "isActive", "isApproved", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id, name, email, role`,
      {
        bind: ['Admin User', 'admin@logiccamp.com', hashedPassword, 'admin', true, true]
      }
    );
    
    if (results.length > 0) {
      console.log('Admin user created successfully:', results[0]);
    } else {
      console.log('Admin user already exists');
    }
    
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();