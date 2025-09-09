require('dotenv').config();
const { sequelize } = require('./src/lib/database');
const { Task, User, Goal, Project } = require('./src/models');

async function verifyFieldChanges() {
  try {
    console.log('🧪 Verifying field name changes in Task model...');
    
    // Get the Task model attributes
    const taskAttributes = Task.getAttributes();
    
    // Check if the renamed fields exist
    console.log('\n📋 Checking Task model attributes:');
    console.log('- assigned_to_id exists:', !!taskAttributes.assigned_to_id);
    console.log('- created_by_id exists:', !!taskAttributes.created_by_id);
    console.log('- assigned_to exists:', !!taskAttributes.assigned_to);
    console.log('- created_by exists:', !!taskAttributes.created_by);
    
    // Check associations
    console.log('\n🔗 Checking Task model associations:');
    const associations = Task.associations;
    console.log('- assignedTo association exists:', !!associations.assignedTo);
    console.log('- createdBy association exists:', !!associations.createdBy);
    console.log('- goal association exists:', !!associations.goal);
    
    console.log('\n✅ Field verification complete!');
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('📡 Database connection closed');
  }
}

// Run the verification
verifyFieldChanges();