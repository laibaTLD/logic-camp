import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Task, User, Project } from '../../../../models';
import { logger } from '../../../../utils/logger';
import { ValidationError } from '../../../../utils/errors';

// Validation schema for task creation
const taskCreateSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters').max(200, 'Task title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['pending', 'in-progress', 'review', 'completed', 'cancelled']).optional().default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  type: z.enum(['feature', 'bug', 'improvement', 'documentation', 'testing']).optional().default('feature'),
  estimatedHours: z.number().positive('Estimated hours must be positive').optional(),
  dueDate: z.string().datetime('Invalid due date format'),
  projectId: z.number().positive('Project ID must be positive'),
  assignedToId: z.number().positive('Assigned user ID must be positive').optional(),
  tags: z.array(z.string()).optional().default([]),
  attachments: z.array(z.string()).optional().default([]),
});

// Validation schema for task query parameters
const taskQuerySchema = z.object({
  status: z.enum(['pending', 'in-progress', 'review', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.enum(['feature', 'bug', 'improvement', 'documentation', 'testing']).optional(),
  projectId: z.string().transform(val => parseInt(val)).optional(),
  assignedToId: z.string().transform(val => parseInt(val)).optional(),
  createdById: z.string().transform(val => parseInt(val)).optional(),
  page: z.string().transform(val => parseInt(val)).optional().default('1'),
  limit: z.string().transform(val => parseInt(val)).optional().default('10'),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.request('GET', '/api/tasks');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validationResult = taskQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
      throw new ValidationError(`Query validation failed: ${errors.join(', ')}`);
    }

    const { status, priority, type, projectId, assignedToId, createdById, page, limit, search } = validationResult.data;

    // Build where clause
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (type) whereClause.type = type;
    if (projectId) whereClause.projectId = projectId;
    if (assignedToId) whereClause.assignedToId = assignedToId;
    if (createdById) whereClause.createdById = createdById;
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } },
      ];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch tasks with associations
    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'description'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const duration = Date.now() - startTime;
    logger.request('GET', '/api/tasks', duration, 200);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Tasks retrieved successfully',
        data: {
          tasks,
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
      logger.request('GET', '/api/tasks', duration, 400);
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
    logger.error('Unexpected error in tasks GET route:', error);
    logger.request('GET', '/api/tasks', duration, 500);

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
    logger.request('POST', '/api/tasks');

    // TODO: Add authentication middleware
    // For now, we'll use a placeholder user ID
    const userId = 1; // This should come from JWT token

    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = taskCreateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }

    const taskData = validationResult.data;

    // Validate due date
    const dueDate = new Date(taskData.dueDate);
    if (dueDate <= new Date()) {
      throw new ValidationError('Due date must be in the future');
    }

    // Create task
    const task = await Task.create({
      ...taskData,
      dueDate,
      createdById: userId,
    });

    // Fetch task with associations
    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });

    const duration = Date.now() - startTime;
    logger.request('POST', '/api/tasks', duration, 201);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Task created successfully',
        data: createdTask,
      },
      { status: 201 }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof ValidationError) {
      logger.request('POST', '/api/tasks', duration, 400);
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
    logger.error('Unexpected error in tasks POST route:', error);
    logger.request('POST', '/api/tasks', duration, 500);

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
