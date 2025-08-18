// src/lib/init-db.ts
import { sequelize, testConnection } from './database';
import { initializeModels, setupAssociations } from '../models';

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Test database connection first
    console.log('🔌 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection established');

    // Initialize all models (this creates the model definitions and syncs tables)
    console.log('📋 Initializing models...');
    await initializeModels();
    console.log('✅ Models initialized and tables synced');

    // Setup associations between models
    console.log('🔗 Setting up model associations...');
    setupAssociations();
    console.log('✅ Model associations configured');

    console.log('🎉 Database initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
}

// Additional helper function for testing database operations
export async function testDatabaseOperations() {
  try {
    console.log('🧪 Testing basic database operations...');
    
    // Import models after initialization
    const { User, Team, Project } = await import('../models');
    
    // Test creating a user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'user',
      isActive: true,
      isApproved: true,
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