// src/lib/db.ts
import { initializeDatabase } from './init-db';

let isInitialized = false;
let modelsCache: any = null;

/**
 * Ensures database is initialized before any operations
 * This prevents the "Cannot read properties of undefined" error
 */
export async function ensureDbInitialized() {
  if (!isInitialized) {
    console.log('🔄 Database not initialized, initializing now...');
    try {
      await initializeDatabase();
      isInitialized = true;
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw new Error('Failed to initialize database');
    }
  }
  return isInitialized;
}

/**
 * Get models after ensuring database is initialized
 * This is the safe way to import models in API routes
 * Uses caching to avoid repeated imports
 */
export async function getModels() {
  await ensureDbInitialized();
  
  if (!modelsCache) {
    try {
      // Dynamic import to ensure models are available after initialization
      modelsCache = await import('../models');
      console.log('📦 Models loaded and cached');
    } catch (error) {
      console.error('❌ Failed to load models:', error);
      throw new Error('Failed to load database models');
    }
  }
  
  return modelsCache;
}

/**
 * Check if database is ready for operations
 */
export function isDatabaseReady(): boolean {
  return isInitialized && modelsCache !== null;
}

/**
 * Reset initialization flag and clear cache
 * Useful for testing or reinitializing
 */
export function resetDbInitialization() {
  isInitialized = false;
  modelsCache = null;
  console.log('🔄 Database initialization reset');
}

/**
 * Graceful database connection check
 * Use this in health check endpoints
 */
export async function checkDatabaseHealth() {
  try {
    const { User } = await getModels();
    await User.findOne({ limit: 1 });
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { 
      status: 'unhealthy', 
      error: error, 
      timestamp: new Date().toISOString() 
    };
  }
}