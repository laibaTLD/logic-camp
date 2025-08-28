import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// ------------------
// Helper: Verify JWT
// ------------------
function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authentication required");
  }

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role?: string };
  } catch (err) {
    throw new Error("Invalid token");
  }
}

// ------------------
// GET Projects
// ------------------
export async function GET(req: NextRequest) {
  try {
    verifyToken(req); // just verify, no need to extract user for GET

    const { Project } = await getModels();
    const projects = await Project.findAll();

    return NextResponse.json(projects, { status: 200 });
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
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role?: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // 2️⃣ Parse body
    const body = await req.json();
    const { name, description, status = "planning", priority = "medium", teamId, memberIds = [] } = body;

    if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 });

    const models = await getModels();
    const { Project, Team, TeamMember, ProjectMember, User } = models;

    // Start a transaction for atomicity
    const transaction = await models.sequelize.transaction();

    try {
      let finalTeamId = teamId;
      
      // 3️⃣ If no teamId provided, create a new team first
      if (!finalTeamId) {
        const team = await Team.create({
          name: `${name} Team`,
          description: `Team for project: ${description || name}`,
          isActive: true,
          createdById: user.id,
        }, { transaction });
        
        finalTeamId = team.id;
        
        // Add creator to the team
        await TeamMember.create({
          userId: user.id,
          teamId: team.id,
          role: "owner",
        }, { transaction });
        
        // Add additional members to the team if provided
        if (memberIds.length > 0) {
          const teamMemberPromises = memberIds
            .filter((id: number) => id !== user.id) // Don't duplicate creator
            .map((userId: number) => 
              TeamMember.create({
                userId,
                teamId: team.id,
                role: "member",
              }, { transaction })
            );
          await Promise.all(teamMemberPromises);
        }
      }

      // 4️⃣ Create project with team
      const newProject = await Project.create({
        name,
        description,
        status,
        priority,
        teamId: finalTeamId,
        createdById: user.id,
      }, { transaction });

      // 5️⃣ Add creator to project members
      await ProjectMember.create({
        userId: user.id,
        projectId: newProject.id,
        role: "owner",
      }, { transaction });
      
      // Add additional members to the project if provided
      if (memberIds.length > 0) {
        const projectMemberPromises = memberIds
          .filter((id: number) => id !== user.id) // Don't duplicate creator
          .map((userId: number) => 
            ProjectMember.create({
              userId,
              projectId: newProject.id,
              role: "member",
            }, { transaction })
          );
        await Promise.all(projectMemberPromises);
      }

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

