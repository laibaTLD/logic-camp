import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Helper: Verify Admin
function checkAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return null; // ✅ means authorized
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
  }
}

// POST Create Project with Team (Atomic Operation)
export async function POST(req: NextRequest) {
  const authError = checkAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, description, memberIds, status = "planning", priority = "medium" } = body;

    if (!name) {
      return NextResponse.json({ 
        success: false, 
        error: "Project name is required" 
      }, { status: 400 });
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "At least one team member is required" 
      }, { status: 400 });
    }

    const models = await getModels();
    const { User, Team, Project, TeamMember, ProjectMember } = models;

    // Start a transaction for atomicity
    const transaction = await models.sequelize.transaction();

    try {
      // 1. Create the team first
      const team = await Team.create({
        name: `${name} Team`,
        description: `Team for project: ${description || name}`,
        isActive: true,
        createdById: memberIds[0], // First member becomes team creator
      }, { transaction });

      // 2. Add all members to the team
      const teamMemberPromises = memberIds.map(userId => 
        TeamMember.create({
          userId,
          teamId: team.id,
        }, { transaction })
      );
      await Promise.all(teamMemberPromises);

      // 3. Create the project linked to the team
      const project = await Project.create({
        name,
        description,
        status,
        priority,
        teamId: team.id,
        createdById: memberIds[0], // First member becomes project creator
      }, { transaction });

      // 4. Add all members to the project
      const projectMemberPromises = memberIds.map(userId => 
        ProjectMember.create({
          userId,
          projectId: project.id,
        }, { transaction })
      );
      await Promise.all(projectMemberPromises);

      // 5. Commit the transaction
      await transaction.commit();

      // 6. Fetch the created project with associations
      const createdProject = await Project.findByPk(project.id, {
        include: [
          { model: Team, as: 'team' },
          { model: User, as: 'creator' },
          { model: User, as: 'members', through: 'project_members' }
        ]
      });

      return NextResponse.json({
        success: true,
        message: "Project and team created successfully",
        project: createdProject,
        team: team
      }, { status: 201 });

    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();
      throw error;
    }

  } catch (err: any) {
    console.error("Error creating project with team:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to create project with team"
    }, { status: 500 });
  }
}
