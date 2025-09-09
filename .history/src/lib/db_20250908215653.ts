// src/lib/db.ts
import { initializeDatabase } from './init-db';

let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

/**
 * Ensure database is initialized before performing operations
 * This prevents multiple initialization attempts
 */
export async function ensureDbInitialized(): Promise<boolean> {
  if (isInitialized) {
    console.log('✅ Database already initialized');
    return true;
  }

  if (initializationPromise) {
    console.log('⏳ Database initialization in progress, waiting...');
    return initializationPromise;
  }

  console.log('🔄 Starting database initialization...');
  
  initializationPromise = (async () => {
    try {
      await initializeDatabase();
      isInitialized = true;
      console.log('✅ Database initialization complete');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      initializationPromise = null;
      throw error;
    }
  })();

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

// Type-safe getter for models
export type ModelsType = typeof import('../models');

// Reset initialization flag (useful for testing)
export function resetDbInitialization(): void {
  isInitialized = false;
  initializationPromise = null;
}