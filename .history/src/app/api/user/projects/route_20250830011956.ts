import { NextRequest, NextResponse } from "next/server";
import getModels from "../../../../models";
import { authenticateUser } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;
    const userId = ((payload as unknown) as { sub: string }).sub;

    const { Project, ProjectMember, Team, User, Task } = await getModels();

    const projects = await Project.findAll({
      include: [
        {
          model: ProjectMember,
          where: { userId },
          required: true,
        },
        Team,
        { model: User, as: 'members' },
        { model: Task, as: 'tasks' },
      ],
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}