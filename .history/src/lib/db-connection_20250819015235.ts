// src/lib/db-connection.ts
import { sequelize } from './database';
import { initializeModels, setupAssociations } from '../models';

let isInitialized = false;

/**
 * Ensures database is initialized before using models.
 * This function is idempotent - safe to call multiple times.
 */
export async function ensureDatabaseConnection() {
  if (isInitialized) {
    return; // Already initialized
  }

  try {
    console.log('🔄 Initializing database connection...');
    
    // Test connection
    await sequelize.authenticate();
    
    // Initialize models
    await initializeModels();
    
    // Setup associations
    setupAssociations();
    
    isInitialized = true;
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Get initialized models after ensuring database connection
 */
export async function getModels() {
  await ensureDatabaseConnection();
  
  // Dynamic import to ensure models are initialized
  const models = await import('../models');
  return models;
}