// src/lib/db.ts
import { initializeDatabase } from './init-db';

let isInitialized = false;

/**
 * Ensures database is initialized before any operations
 * This prevents the "Cannot read properties of undefined" error
 */
export async function ensureDbInitialized() {
  if (!isInitialized) {
    console.log('🔄 Database not initialized, initializing now...');
    await initializeDatabase();
    isInitialized = true;
    console.log('✅ Database initialization complete');
  }
  return isInitialized;
}

/**
 * Get models after ensuring database is initialized
 * This is the safe way to import models in API routes
 */
export async function getModels() {
  await ensureDbInitialized();
  
  // Dynamic import to ensure models are available after initialization
  const models = await import('../models');
  return models;
}

// Reset initialization flag (useful for testing)
export function resetDbInitialization() {
  isInitialized = false;
}