import { initializeDatabase } from './src/lib/init-db';
import { seedDatabase } from './src/lib/seed-db';

async function testDatabase() {
  try {
    console.log('🧪 Testing database connection and setup...\n');
    
    // Initialize database
    await initializeDatabase();
    
    console.log('\n🌱 Seeding database with sample data...\n');
    
    // Seed database
    await seedDatabase();
    
    console.log('\n✅ All tests passed! Database is working correctly.');
    console.log('\n📝 Test credentials:');
    console.log('   Admin: admin@myteamcamp.com / admin123');
    console.log('   User:  john@myteamcamp.com / user123');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testDatabase();
