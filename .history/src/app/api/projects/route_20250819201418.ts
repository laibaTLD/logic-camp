import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '../../../lib/auth';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Project name must be less than 200 characters'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  teamId: z.number().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const { Project, User, Team } = await getModels();
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = authResult;
    const { searchParams } = new URL(request.url);
    
    // Build query options
    const where: any = {};
    const include: any[] = [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: Team, as: 'team', attributes: ['id', 'name'] }
    ];

    // Filter by status
    if (searchParams.get('status')) {
      where.status = searchParams.get('status');
    }

    // Filter by priority
    if (searchParams.get('priority')) {
      where.priority = searchParams.get('priority');
    }

    // Filter by team
    if (searchParams.get('teamId')) {
      where.teamId = parseInt(searchParams.get('teamId')!);
    }

    const projects = await Project.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = authResult;
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Create project
    const project = await Project.create({
      ...validatedData,
      createdById: payload.userId,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
    });

    // Fetch project with associations
    const createdProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] }
      ]
    });

    return NextResponse.json(
      { message: 'Project created successfully', project: createdProject },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
