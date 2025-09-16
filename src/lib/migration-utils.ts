// src/lib/migration-utils.ts
import { Sequelize } from 'sequelize';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Simple migration utilities for updating database with model changes
 */
export class SimpleMigrationUtils {
  private sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  /**
   * Run pending migrations using Sequelize CLI
   */
  async runMigrations(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Running migrations...');
      const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate');
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }
      
      console.log('✅ Migrations completed successfully');
      console.log(stdout);
      return { success: true, message: 'Migrations completed successfully' };
    } catch (error) {
      const message = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌', message);
      return { success: false, message };
    }
  }

  /**
   * Rollback last migration using Sequelize CLI
   */
  async rollbackLastMigration(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Rolling back last migration...');
      const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate:undo');
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }
      
      console.log('✅ Rollback completed successfully');
      console.log(stdout);
      return { success: true, message: 'Rollback completed successfully' };
    } catch (error) {
      const message = `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌', message);
      return { success: false, message };
    }
  }

  /**
   * Check migration status
   */
  async getStatus(): Promise<void> {
    try {
      // Check if SequelizeMeta table exists first
      const [tableExists] = await this.sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'SequelizeMeta'
        )
      `);
      
      const exists = (tableExists as any[])[0]?.exists;
      
      if (!exists) {
        console.log('📊 Migration Status:');
        console.log('ℹ️  No migrations have been run yet (SequelizeMeta table does not exist)');
        return;
      }
      
      const [results] = await this.sequelize.query(
        "SELECT name FROM SequelizeMeta ORDER BY name"
      );
      
      const executedMigrations = (results as any[]).map(r => r.name);
      
      console.log('📊 Migration Status:');
      console.log(`✅ Executed migrations: ${executedMigrations.length}`);
      
      if (executedMigrations.length > 0) {
        console.log('\n📝 Executed migrations:');
        executedMigrations.forEach(migration => {
          console.log(`  - ${migration}`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to get migration status:', error);
    }
  }
}

/**
 * Helper function to create a new migration
 */
export function createMigrationTemplate(name: string): string {
  const template = `'use strict';

/**
 * ${name}
 * Description: [Add description of what this migration does]
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Add your migration logic here
      // Example:
      // await queryInterface.addColumn('table_name', 'column_name', {
      //   type: Sequelize.STRING,
      //   allowNull: true
      // }, { transaction: t });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Add your rollback logic here
      // Example:
      // await queryInterface.removeColumn('table_name', 'column_name', { transaction: t });
    });
  }
};
`;

  return template;
}
