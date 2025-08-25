export async function POST(request: NextRequest) {
  try {
    const { Project, User, Team, TeamMember } = await getModels();

    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create projects' }, { status: 403 });
    }

    const body = await request.json();

    // Accept optional memberIds array
    const { memberIds, ...projectData } = body;

    const validatedData = createProjectSchema.parse(projectData);

    if (validatedData.teamId) {
      const teamExists = await Team.findByPk(validatedData.teamId);
      if (!teamExists) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
    }

    // 1️⃣ Create project
    const project = await Project.create({
      ...validatedData,
      createdById: payload.userId,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
    });

    // 2️⃣ Add team members if provided
    if (Array.isArray(memberIds) && memberIds.length > 0) {
      for (const userId of memberIds) {
        await TeamMember.create({
          projectId: project.id,
          userId,
        });
      }
    }

    const createdProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
      ],
    });

    return NextResponse.json({ message: 'Project created successfully', project: createdProject }, { status: 201 });

  } catch (error) {
    console.error('Create project error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
