// src/lib/init-db.ts
import { sequelize } from './database';
import { initializeModels } from '../models';
import { setupAssociations } from '../models';

export async function initializeDatabase(): Promise<boolean> {
  try {
    console.log('🔧 Initializing database models...');
    // Initialize models
    initializeModels(sequelize);
    
    console.log('🔗 Setting up model associations...');
    // Setup associations between models
    setupAssociations();
    
    console.log('📊 Syncing database schema...');
    // Sync database (this creates tables if they don't exist)
    await sequelize.sync({ alter: false }); // Use alter: true to update tables if needed
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Additional helper function for testing database operations
export async function testDatabaseOperations(): Promise<void> {
  try {
    console.log('🧪 Testing basic database operations...');
    
    // Import models after initialization
    const { User, Team, Project } = await import('../models');
    
    // Test creating a user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'employee',
      is_active: true,
      is_approved: true,
    });
    
    console.log('✅ Test user created:', testUser.id);
    
    // Clean up test data
    await testUser.destroy();
    console.log('✅ Test data cleaned up');
    
    console.log('🎉 Database operations test completed successfully!');
  } catch (error) {
    console.error('❌ Database operations test failed:', error);
    throw error;
  }
}

// Auto-run if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(async () => {
      console.log('🚀 Database setup complete');
      
      // Optionally run tests
      if (process.argv.includes('--test')) {
        await testDatabaseOperations();
      }
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}