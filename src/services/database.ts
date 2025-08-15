import { sequelize } from '../models';
import { logger } from '../utils/logger';

export class DatabaseService {
  private static instance: DatabaseService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection and sync models
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('Database already initialized');
      return;
    }

    try {
      // Test database connection
      await sequelize.authenticate();
      logger.info('Database connection established successfully');

      // Sync models with database (in development)
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        logger.info('Database models synchronized');
      }

      this.isInitialized = true;
      logger.info('Database service initialized successfully');
    } catch (error) {
      logger.error('Database initialization failed:', error);
      throw new Error(`Database initialization failed: ${error}`);
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    try {
      await sequelize.close();
      this.isInitialized = false;
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection:', error);
      throw new Error(`Error closing database connection: ${error}`);
    }
  }

  /**
   * Get database connection status
   */
  public getStatus(): { isInitialized: boolean; isConnected: boolean } {
    return {
      isInitialized: this.isInitialized,
      isConnected: sequelize.authenticate().then(() => true).catch(() => false)
    };
  }

  /**
   * Run database migrations
   */
  public async runMigrations(): Promise<void> {
    try {
      // This would typically use sequelize-cli
      // For now, we'll use sync with alter: true in development
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        logger.info('Database migrations completed');
      } else {
        logger.info('Skipping migrations in production - use sequelize-cli');
      }
    } catch (error) {
      logger.error('Database migration failed:', error);
      throw new Error(`Database migration failed: ${error}`);
    }
  }

  /**
   * Seed database with initial data
   */
  public async seedDatabase(): Promise<void> {
    try {
      // This would typically use sequelize-cli seeders
      // For now, we'll create a basic admin user if none exists
      const { User, Team } = await import('../models');
      
      const userCount = await User.count();
      if (userCount === 0) {
        logger.info('Seeding database with initial data...');
        
        // Create default admin user
        const adminUser = await User.create({
          name: 'Admin User',
          email: 'admin@myteamcamp.com',
          password: 'admin123', // This will be hashed by the model hook
          role: 'admin',
          emailVerified: true,
        });

        // Create default team
        const defaultTeam = await Team.create({
          name: 'Default Team',
          description: 'Default team for the application',
          ownerId: adminUser.id,
        });

        logger.info('Database seeded successfully');
      } else {
        logger.info('Database already has data, skipping seed');
      }
    } catch (error) {
      logger.error('Database seeding failed:', error);
      throw new Error(`Database seeding failed: ${error}`);
    }
  }

  /**
   * Reset database (drop all tables and recreate)
   */
  public async resetDatabase(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot reset database in production');
      }

      logger.warn('Resetting database...');
      await sequelize.drop();
      await sequelize.sync({ force: true });
      this.isInitialized = false;
      
      // Re-seed the database
      await this.seedDatabase();
      
      logger.info('Database reset completed');
    } catch (error) {
      logger.error('Database reset failed:', error);
      throw new Error(`Database reset failed: ${error}`);
    }
  }
}

export default DatabaseService.getInstance();
