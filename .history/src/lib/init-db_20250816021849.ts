import { sequelize, testConnection, syncDatabase } from './database';
import { initializeModels, setupAssociations } from '../models';

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Test connection
    await testConnection();
    
    // Initialize models
    initializeModels();
    
    // Setup associations
    setupAssociations();
    
    // Sync database
    await syncDatabase();
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Auto-initialize if this file is imported
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}
