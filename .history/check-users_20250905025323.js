const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Query users table directly
    const [results] = await sequelize.query('SELECT id, name, email, role, isActive, isApproved FROM Users ORDER BY id');
    
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