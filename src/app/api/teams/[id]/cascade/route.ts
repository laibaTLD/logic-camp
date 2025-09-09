import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// -------------------
// DELETE /api/teams/:id/cascade - Delete team with all associated projects
// -------------------
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { Team, Project, TeamMember, Task, ProjectMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete teams' }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    const team = await Team.findByPk(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    // Get all associated projects
    const projects = await Project.findAll({ where: { teamId } });
    const projectIds = projects.map(p => p.id);

    // Start transaction for cascade deletion
    const sequelize = Team.sequelize;
    const transaction = await sequelize!.transaction();

    try {
      // Delete tasks associated with projects
      if (projectIds.length > 0) {
        await Task.destroy({ 
          where: { projectId: projectIds },
          transaction 
        });

        // Delete project members
        await ProjectMember.destroy({ 
          where: { projectId: projectIds },
          transaction 
        });

        // Delete projects
        await Project.destroy({ 
          where: { teamId },
          transaction 
        });
      }

      // Delete team members
      await TeamMember.destroy({ 
        where: { teamId },
        transaction 
      });

      // Delete the team
      await team.destroy({ transaction });

      await transaction.commit();

      return NextResponse.json({ 
        message: 'Team and all associated projects deleted successfully',
        deletedProjects: projects.length
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (err) {
    console.error('Cascade delete team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}