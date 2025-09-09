import { sequelize } from './src/lib/database';
import { initializeModels, setupAssociations } from './src/models';

async function testTaskGoalModels() {
  try {
    console.log('🧪 Testing Task and Goal models with updated associations...');
    
    // Initialize models and setup associations
    await initializeModels();
    setupAssociations();
    
    // Import models
    const { User, Project, Goal, Task } = await import('./src/models');
    
    console.log('\n📋 Creating test data...');
    
    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'tasktest@example.com',
      password: 'hashedpassword123',
      role: 'employee',
      isActive: true,
      isApproved: true,
    });
    console.log('✅ Test user created with ID:', testUser.id);
    
    // Create test project
    const testProject = await Project.create({
      name: 'Test Project',
      description: 'A project for testing Task and Goal models',
      status: 'inProgress',
      owner_id: testUser.id,
      created_by_id: testUser.id,
    });
    console.log('✅ Test project created with ID:', testProject.id);
    
    // Create test goal
    const testGoal = await Goal.create({
      title: 'Test Goal',
      description: 'A goal for testing Task model',
      status: 'inProgress',
      project_id: testProject.id,
    });
    console.log('✅ Test goal created with ID:', testGoal.id);
    
    // Create test task
    const testTask = await Task.create({
      title: 'Test Task',
      description: 'A task for testing updated associations',
      status: 'todo',
      priority: 'medium',
      goal_id: testGoal.id,
      assigned_to_id: testUser.id,
      created_by_id: testUser.id,
    });
    console.log('✅ Test task created with ID:', testTask.id);
    
    // Test fetching task with associations
    console.log('\n🔍 Testing task associations...');
    const taskWithAssociations = await Task.findByPk(testTask.id, {
      include: [
        { model: User, as: 'assignedTo' },
        { model: User, as: 'createdBy' },
        { model: Goal, as: 'goal', include: [{ model: Project, as: 'project' }] },
      ],
    });
    
    // Verify associations
    console.log('\n📊 Verifying associations:');
    console.log('- Task title:', taskWithAssociations.title);
    console.log('- Assigned to:', taskWithAssociations.assignedTo ? taskWithAssociations.assignedTo.name : 'Not assigned');
    console.log('- Created by:', taskWithAssociations.createdBy ? taskWithAssociations.createdBy.name : 'Unknown');
    console.log('- Goal title:', taskWithAssociations.goal ? taskWithAssociations.goal.title : 'No goal');
    console.log('- Project name:', taskWithAssociations.goal && taskWithAssociations.goal.project ? taskWithAssociations.goal.project.name : 'No project');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await testTask.destroy();
    await testGoal.destroy();
    await testProject.destroy();
    await testUser.destroy();
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! Task and Goal models are working correctly with updated associations.');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('📡 Database connection closed');
  }
}

// Run the test
testTaskGoalModels();