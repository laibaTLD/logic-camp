// Test database initialization
const { initializeDatabase } = require('./src/lib/init-db');

async function testInit() {
  try {
    console.log('Testing database initialization...');
    await initializeDatabase();
    console.log('✅ Database initialization successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

testInit();