import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  teamId: z.number().optional(),
});

// PATCH /api/projects/:id
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Project, User, Team } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;

    // ✅ Admin-only
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update projects' }, { status: 403 });
    }

    const projectId = parseInt(params.id);
    const project = await Project.findByPk(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsedData = updateProjectSchema.parse(body);

    // ✅ Make a mutable copy to fix readonly error
    const validatedData: any = { ...parsedData };

    // Convert dates to JS Date objects
    if (validatedData.startDate) validatedData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate) validatedData.endDate = new Date(validatedData.endDate);

    await project.update(validatedData);

    const updatedProject = await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
      ],
    });

    return NextResponse.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (err: any) {
    console.error('Update project error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
