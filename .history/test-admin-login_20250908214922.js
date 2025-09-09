// Test script for admin login API
// Fix import paths for running from project root
const { getModels, ensureDbInitialized } = require('./src/lib/db.js');
const bcrypt = require('bcryptjs');

async function testAdminLogin() {
  try {
    console.log('Ensuring database is initialized...');
    await ensureDbInitialized();
    console.log('Database initialized, getting models...');
    
    const models = await getModels();
    console.log('Models retrieved successfully:', Object.keys(models));
    
    const { User } = models;
    console.log('User model retrieved:', !!User);
    
    // Test finding admin user
    const email = 'admin@example.com';
    console.log('Looking for admin with email:', email);
    
    const admin = await User.findOne({ where: { email, role: 'admin' } });
    if (!admin) {
      console.log('Admin not found, creating test admin user...');
      // Create a test admin user if not exists
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        is_approved: true
      });
      console.log('Test admin user created:', newAdmin.id);
    } else {
      console.log('Admin found:', admin.id);
      console.log('Admin data:', {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      });
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error in test:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testAdminLogin();