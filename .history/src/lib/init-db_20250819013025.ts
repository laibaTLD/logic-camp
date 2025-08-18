// src/lib/init-db.ts
import { sequelize, testConnection } from './database';
import { initializeModels, setupAssociations } from '../models';

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    await testConnection();

    // Initialize models
    await initializeModels();   // <-- await here

    // Setup associations
    setupAssociations();

    await syncDatabase();  // optional, can remove if models already synced
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Auto-run if this file is executed directly
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
