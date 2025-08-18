import { User, Project, Task, Team, TeamMember } from '../models';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@myteamcamp.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await User.create({
      name: 'John Doe',
      email: 'john@myteamcamp.com',
      password: userPassword,
      role: 'member',
      isActive: true,
    });

    // Create team
    const team = await Team.create({
      name: 'Development Team',
      description: 'Main development team for the project',
      isActive: true,
      createdById: admin.id,
    });

    // Add users to team
    await TeamMember.create({
      userId: admin.id,
      teamId: team.id,
      role: 'owner',
      isActive: true,
    });

    await TeamMember.create({
      userId: user.id,
      teamId: team.id,
      role: 'member',
      isActive: true,
    });

    // Create project
    const project = await Project.create({
      name: 'MyTeamCamp Application',
      description: 'A team management application built with Next.js and PostgreSQL',
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-01-01'),
      createdById: admin.id,
      teamId: team.id,
    });

    // Create tasks
    await Task.create({
      title: 'Set up database schema',
      description: 'Create all necessary database tables and relationships',
      status: 'completed',
      priority: 'high',
      projectId: project.id,
      assignedToId: admin.id,
      createdById: admin.id,
      estimatedHours: 4,
      actualHours: 3.5,
    });

    await Task.create({
      title: 'Implement authentication',
      description: 'Set up JWT-based authentication system',
      status: 'in-progress',
      priority: 'high',
      projectId: project.id,
      assignedToId: user.id,
      createdById: admin.id,
      estimatedHours: 6,
    });

    await Task.create({
      title: 'Create project management features',
      description: 'Implement CRUD operations for projects',
      status: 'todo',
      priority: 'medium',
      projectId: project.id,
      assignedToId: user.id,
      createdById: admin.id,
      estimatedHours: 8,
    });

    console.log('Database seeded successfully!');
    console.log('Admin user: admin@myteamcamp.com / admin123');
    console.log('Regular user: john@myteamcamp.com / user123');
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
}

// Auto-run if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
