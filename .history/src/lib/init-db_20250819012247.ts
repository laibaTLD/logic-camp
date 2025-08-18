// src/lib/init-db.ts
import { sequelize, testConnection } from './database';
import { initializeModels, setupAssociations } from '../models';

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Test DB connection
    await testConnection();

    // Initialize models (create tables if not exist)
    await initializeModels(); // Note: returning Promise if using sync({ alter: true })

    // Setup associations AFTER models are initialized
    setupAssociations();

    // Sync database (ensure tables & constraints)
    await sequelize.sync({ alter: true }); // optional: { force: true } to drop & recreate

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
