import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";


// ------------------
// GET Projects
// ------------------
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const user = { id: authResult.user.userId, email: authResult.user.email, role: authResult.user.role };

    const models = await getModels();
    const { Project, User, Team, TeamMember } = models;
    
    // Fetch projects with team members included
    const projects = await Project.findAll({
      include: [
        {
          model: Team,
          as: 'team',
          include: [
            {
              model: User,
              as: 'members',
              through: {
                attributes: ['role', 'joinedAt', 'isActive'],
                where: { isActive: true }
              },
              attributes: ['id', 'name', 'email', 'role']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Transform the data to include members at project level for easier access
    const transformedProjects = projects.map(project => {
      const projectData = project.toJSON() as any;
      return {
        ...projectData,
        members: projectData.team?.members || []
      };
    });

    return NextResponse.json(transformedProjects, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching projects:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch projects" }, { status: 500 });
  }
}

// ------------------
// POST Create Project
// ------------------
export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Verify JWT and extract user
    const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const user = { id: authResult.user.userId, email: authResult.user.email, role: authResult.user.role };

    // 2️⃣ Parse body
    const body = await req.json();
    const { name, description, status = "todo", priority = "medium", teamId } = body;

    if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    if (!teamId) return NextResponse.json({ error: "Team ID is required" }, { status: 400 });

    const models = await getModels();
    const { Project, Team, ProjectMember, User } = models;

    // Start a transaction for atomicity
    const transaction = await models.sequelize.transaction();

    try {
      // Verify the team exists
      const team = await Team.findByPk(teamId, { transaction });
      if (!team) {
        await transaction.rollback();
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      // Create project with team
      const newProject = await Project.create({
        name,
        description,
        status,
        priority,
        teamId,
        createdById: user.id,
      }, { transaction });

      // Add creator to project members
      await ProjectMember.create({
        user_id: user.id,
        projectId: newProject.id,
        role: "owner",
      }, { transaction });

      // 6️⃣ Commit the transaction
      await transaction.commit();

      // 7️⃣ Fetch the created project with associations
      const createdProject = await Project.findByPk(newProject.id, {
        include: [
          { model: Team, as: 'team' },
          { model: User, as: 'creator' },
          { model: User, as: 'members', through: { attributes: [] } }
        ]
      });

      return NextResponse.json({
        success: true,
        project: createdProject,
        message: "Project created successfully"
      }, { status: 201 });

    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();
      throw error;
    }

  } catch (err: any) {
    console.error("Error creating project:", err);
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 });
  }
}

