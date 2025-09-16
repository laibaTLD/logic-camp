// src/scripts/run-migrations.ts
import { sequelize } from '../lib/database';
import { SimpleMigrationUtils } from '../lib/migration-utils';

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    const migrationUtils = new SimpleMigrationUtils(sequelize);

    // Check current status (skip if SequelizeMeta doesn't exist)
    console.log('📊 Current migration status:');
    try {
      await migrationUtils.getStatus();
    } catch (error) {
      console.log('ℹ️  No migrations have been run yet');
    }

    // Run migrations
    console.log('\n🔄 Running pending migrations...');
    const result = await migrationUtils.runMigrations();

    if (result.success) {
      console.log('\n✅ All migrations completed successfully!');
      
      // Show updated status
      console.log('\n📊 Updated migration status:');
      try {
        await migrationUtils.getStatus();
      } catch (error) {
        console.log('ℹ️  Migration status check failed, but migrations completed successfully');
      }
    } else {
      console.error('\n❌ Migration failed:', result.message);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}
