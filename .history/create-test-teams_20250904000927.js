const { getModels } = require('./src/lib/db');

async function createTestTeams() {
  try {
    const { Team, User } = await getModels();
    
    // Find an admin user to be the creator
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }
    
    const testTeams = [
      { name: 'Development Team', description: 'Frontend and backend developers' },
      { name: 'Design Team', description: 'UI/UX designers and graphic artists' },
      { name: 'Marketing Team', description: 'Digital marketing and content creators' },
      { name: 'QA Team', description: 'Quality assurance and testing specialists' },
      { name: 'DevOps Team', description: 'Infrastructure and deployment specialists' },
      { name: 'Product Team', description: 'Product managers and business analysts' },
      { name: 'Sales Team', description: 'Sales representatives and account managers' },
      { name: 'Support Team', description: 'Customer support and technical assistance' },
      { name: 'Research Team', description: 'Research and development specialists' },
      { name: 'Operations Team', description: 'Business operations and administration' }
    ];
    
    console.log('Creating test teams...');
    
    for (const teamData of testTeams) {
      // Check if team already exists
      const existingTeam = await Team.findOne({ where: { name: teamData.name } });
      if (existingTeam) {
        console.log(`Team "${teamData.name}" already exists, skipping...`);
        continue;
      }
      
      const team = await Team.create({
        name: teamData.name,
        description: teamData.description,
        createdById: adminUser.id,
        isActive: true
      });
      
      console.log(`Created team: ${team.name}`);
    }
    
    console.log('Test teams created successfully!');
    
    // Show total count
    const totalTeams = await Team.count();
    console.log(`Total teams in database: ${totalTeams}`);
    
  } catch (error) {
    console.error('Error creating test teams:', error);
  } finally {
    process.exit(0);
  }
}

createTestTeams();