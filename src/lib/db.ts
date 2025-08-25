// src/lib/db.ts
import { initializeDatabase } from './init-db';

let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

/**
 * Ensures database is initialized before any operations
 * This prevents the "Cannot read properties of undefined" error
 */
export async function ensureDbInitialized() {
  if (isInitialized) {
    return true;
  }

  if (!initializationPromise) {
    console.log('🔄 Database not initialized, initializing now...');
    initializationPromise = (async () => {
      try {
        await initializeDatabase();
        isInitialized = true;
        console.log('✅ Database initialization complete');
        return true;
      } finally {
        initializationPromise = null;
      }
    })();
  }

  return initializationPromise;
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
  initializationPromise = null;
}