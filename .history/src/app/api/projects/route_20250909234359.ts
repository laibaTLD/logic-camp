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
    const { Project, Team } = models;

    // Fetch projects with team
    const projects = await Project.findAll({
      include: [
        { model: Team, as: 'team' }
      ]
    });

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
    const authResult = await verifyToken(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const user = { id: authResult.user.userId, email: authResult.user.email, role: authResult.user.role };

    // 2️⃣ Parse request as FormData or JSON
    let name, description, status, teamId, startDate, endDate, file;
    
    // Check if the request is multipart form data
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      status = formData.get('status') as string || 'todo';
      teamId = formData.get('teamId') as string;
      startDate = formData.get('startDate') as string;
      endDate = formData.get('endDate') as string;
      file = formData.get('file') as File | null;
      
      // Validate file size (5MB limit)
      if (file && file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
      }
    } else {
      // Parse as JSON
      const body = await req.json();
      ({ name, description, status = "todo", teamId, startDate, endDate } = body);
    }

    if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    if (!teamId) return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

    const models = await getModels();
    const { Project, Team } = models;

    // Start a transaction for atomicity
    const transaction = await models.sequelize.transaction();

    try {
      // Verify the team exists
      const team = await Team.findByPk(teamId, { transaction });
      if (!team) {
        await transaction.rollback();
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      // Ownership rule: only admin or team_lead can create
      if (user.role !== 'admin' && user.role !== 'team_lead') {
        await transaction.rollback();
        return NextResponse.json({ error: 'Only admins or team leads can create projects' }, { status: 403 });
      }

      // Validate dates if provided
      let parsedStart: Date | undefined = undefined;
      let parsedEnd: Date | undefined = undefined;
      if (startDate) parsedStart = new Date(startDate);
      if (endDate) parsedEnd = new Date(endDate);
      if (parsedStart && parsedEnd && parsedEnd < parsedStart) {
        await transaction.rollback();
        return NextResponse.json({ error: 'end_date must be greater than or equal to start_date' }, { status: 422 });
      }

      // Process file if present
      let fileData = null;
      if (file) {
        // In a real implementation, you would upload to cloud storage
        // and store the URL/reference. Here we're just storing basic file info.
        fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: new Date(file.lastModified)
        };
      }
      
      const newProject = await Project.create({
        name,
        description,
        status,
        start_date: parsedStart,
        end_date: parsedEnd,
        files: fileData,
        team_id: parseInt(teamId as string),
        owner_id: user.id,
      }, { transaction });

      // 6️⃣ Commit the transaction
      await transaction.commit();

      // 7️⃣ Fetch the created project with associations
      const createdProject = await Project.findByPk(newProject.id, {
        include: [
          { model: Team, as: 'team' }
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

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false
  }
}
  },
};

