import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Project, User, Team } from '../../../../models';
import { logger } from '../../../../utils/logger';
import { ValidationError, AuthenticationError } from '../../../../utils/errors';

// Validation schema for project creation
const projectCreateSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(200, 'Project name must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).optional().default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  startDate: z.string().datetime('Invalid start date format'),
  dueDate: z.string().datetime('Invalid due date format'),
  budget: z.number().positive('Budget must be positive').optional(),
  teamId: z.number().positive('Team ID must be positive'),
  tags: z.array(z.string()).optional().default([]),
});

// Validation schema for project query parameters
const projectQuerySchema = z.object({
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  teamId: z.string().transform(val => parseInt(val)).optional(),
  ownerId: z.string().transform(val => parseInt(val)).optional(),
  page: z.string().transform(val => parseInt(val)).optional().default('1'),
  limit: z.string().transform(val => parseInt(val)).optional().default('10'),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.request('GET', '/api/projects');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validationResult = projectQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
      throw new ValidationError(`Query validation failed: ${errors.join(', ')}`);
    }

    const { status, priority, teamId, ownerId, page, limit, search } = validationResult.data;

    // Build where clause
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (teamId) whereClause.teamId = teamId;
    if (ownerId) whereClause.ownerId = ownerId;
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } },
      ];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch projects with associations
    const { count, rows: projects } = await Project.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'description'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const duration = Date.now() - startTime;
    logger.request('GET', '/api/projects', duration, 200);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Projects retrieved successfully',
        data: {
          projects,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
          },
        },
      },
      { status: 200 }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof ValidationError) {
      logger.request('GET', '/api/projects', duration, 400);
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    // Log unexpected errors
    logger.error('Unexpected error in projects GET route:', error);
    logger.request('GET', '/api/projects', duration, 500);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.request('POST', '/api/projects');

    // TODO: Add authentication middleware
    // For now, we'll use a placeholder user ID
    const userId = 1; // This should come from JWT token

    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = projectCreateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }

    const projectData = validationResult.data;

    // Validate dates
    const startDate = new Date(projectData.startDate);
    const dueDate = new Date(projectData.dueDate);
    
    if (dueDate <= startDate) {
      throw new ValidationError('Due date must be after start date');
    }

    // Create project
    const project = await Project.create({
      ...projectData,
      startDate,
      dueDate,
      ownerId: userId,
      progress: 0,
    });

    // Fetch project with associations
    const createdProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });

    const duration = Date.now() - startTime;
    logger.request('POST', '/api/projects', duration, 201);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Project created successfully',
        data: createdProject,
      },
      { status: 201 }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof ValidationError) {
      logger.request('POST', '/api/projects', duration, 400);
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    // Log unexpected errors
    logger.error('Unexpected error in projects POST route:', error);
    logger.request('POST', '/api/projects', duration, 500);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
