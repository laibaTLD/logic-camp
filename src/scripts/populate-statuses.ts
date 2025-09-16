import { initializeDatabase } from '../lib/init-db';
import { Status } from '../models';

async function populateStatuses() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized');

    console.log('Populating statuses table...');
    
    const defaultStatuses = [
      {
        name: 'todo',
        description: 'Task/Project/Goal is pending',
        color: '#6B7280',
        is_default: true,
      },
      {
        name: 'inProgress',
        description: 'Task/Project/Goal is in progress',
        color: '#3B82F6',
        is_default: true,
      },
      {
        name: 'testing',
        description: 'Task/Project/Goal is being tested',
        color: '#F59E0B',
        is_default: true,
      },
      {
        name: 'review',
        description: 'Task/Project/Goal is under review',
        color: '#8B5CF6',
        is_default: true,
      },
      {
        name: 'done',
        description: 'Task/Project/Goal is completed',
        color: '#10B981',
        is_default: true,
      },
    ];

    for (const statusData of defaultStatuses) {
      const [status, created] = await Status.findOrCreate({
        where: { name: statusData.name },
        defaults: statusData,
      });
      
      if (created) {
        console.log(`✅ Created status: ${status.name}`);
      } else {
        console.log(`⚠️  Status already exists: ${status.name}`);
      }
    }

    console.log('✅ Status population completed successfully!');
  } catch (error) {
    console.error('❌ Failed to populate statuses:', error);
    throw error;
  }
}

// Run the script
populateStatuses()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
