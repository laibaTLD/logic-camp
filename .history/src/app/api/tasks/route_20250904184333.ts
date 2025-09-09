// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels, sequelize } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'completed']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().nullable().optional(), // parse manually to Date
  assignedToId: z.number().nullable().optional(), // Keep for backward compatibility
  assigneeIds: z.array(z.number()).optional(), // New field for multiple assignees
  estimatedHours: z.number().min(0).nullable().optional(),
  projectId: z.number().min(1, 'Project ID is required'),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.number().min(1, 'Task ID is required'),
});

// --------------------
// GET /api/tasks - Get all tasks for authenticated user
// --------------------
export async function GET(req: NextRequest) {
  try {
    const { Task, User, Project } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    const tasks = await Task.findAll({
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// POST /api/tasks - Create a new task
// --------------------
export async function POST(req: NextRequest) {
  try {
    const { Task, User, Project, TaskAssignee } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    const body = await req.json();
    const validatedData = createTaskSchema.parse(body);

    // Verify project exists
    const project = await Project.findByPk(validatedData.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Determine assignee IDs (prioritize assigneeIds over assignedToId)
    let assigneeIds: number[] = [];
    if (validatedData.assigneeIds && validatedData.assigneeIds.length > 0) {
      assigneeIds = validatedData.assigneeIds;
    } else if (validatedData.assignedToId) {
      assigneeIds = [validatedData.assignedToId];
    }

    // Verify all assignees exist
    if (assigneeIds.length > 0) {
      const existingUsers = await User.findAll({
        where: { id: assigneeIds },
        attributes: ['id']
      });
      const existingUserIds = existingUsers.map(user => user.id);
      const invalidIds = assigneeIds.filter(id => !existingUserIds.includes(id));
      
      if (invalidIds.length > 0) {
        return NextResponse.json({ 
          error: `Invalid assignee IDs: ${invalidIds.join(', ')}` 
        }, { status: 400 });
      }
    }

    // Use transaction to ensure task is created before assignees
    const result = await sequelize.transaction(async (t) => {
      const task = await Task.create({
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        projectId: validatedData.projectId,
        assignedToId: assigneeIds.length > 0 ? assigneeIds[0] : undefined, // Keep first assignee for backward compatibility
        estimatedHours: validatedData.estimatedHours ?? undefined,
        createdById: payload.userId,
      }, { transaction: t });

      // Create task assignee records
      if (assigneeIds.length > 0) {
        const taskAssignees = assigneeIds.map(userId => ({
          taskId: task.id,
          userId: userId,
          assignedAt: new Date()
        }));
        await TaskAssignee.bulkCreate(taskAssignees, { transaction: t });
      }

      return task;
    });

    const task = result;

    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'status'] },
      ],
    });

    return NextResponse.json(
      { message: 'Task created successfully', task: createdTask },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// PATCH /api/tasks - Update a task
// --------------------
export async function PATCH(req: NextRequest) {
  try {
    const { Task, User, Project, TaskAssignee } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    const body = await req.json();
    const validatedData = updateTaskSchema.parse(body);

    const task = await Task.findByPk(validatedData.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Handle assignee updates
    let assigneeIds: number[] = [];
    if (validatedData.assigneeIds !== undefined) {
      assigneeIds = validatedData.assigneeIds || [];
    } else if (validatedData.assignedToId !== undefined) {
      assigneeIds = validatedData.assignedToId ? [validatedData.assignedToId] : [];
    }

    // Verify all assignees exist if updating assignees
    if (assigneeIds.length > 0) {
      const existingUsers = await User.findAll({
        where: { id: assigneeIds },
        attributes: ['id']
      });
      const existingUserIds = existingUsers.map(user => user.id);
      const invalidIds = assigneeIds.filter(id => !existingUserIds.includes(id));
      
      if (invalidIds.length > 0) {
        return NextResponse.json({ 
          error: `Invalid assignee IDs: ${invalidIds.join(', ')}` 
        }, { status: 400 });
      }
    }

    // Update task
    await task.update({
      title: validatedData.title ?? task.title,
      description: validatedData.description ?? task.description,
      status: validatedData.status ?? task.status,
      priority: validatedData.priority ?? task.priority,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : task.dueDate,
      assignedToId: (validatedData.assigneeIds !== undefined || validatedData.assignedToId !== undefined) 
        ? (assigneeIds.length > 0 ? assigneeIds[0] : null) 
        : task.assignedToId,
      estimatedHours: validatedData.estimatedHours ?? task.estimatedHours,
      projectId: validatedData.projectId ?? task.projectId,
    });

    // Update task assignees if specified
    if (validatedData.assigneeIds !== undefined || validatedData.assignedToId !== undefined) {
      // Remove existing assignees
      await TaskAssignee.destroy({ where: { taskId: task.id } });
      
      // Add new assignees
      if (assigneeIds.length > 0) {
        const taskAssignees = assigneeIds.map(userId => ({
          taskId: task.id,
          userId: userId
        }));
        await TaskAssignee.bulkCreate(taskAssignees);
      }
    }

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'status'] },
      ],
    });

    return NextResponse.json(
      { message: 'Task updated successfully', task: updatedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update task error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// DELETE /api/tasks - Delete a task
// --------------------
export async function DELETE(req: NextRequest) {
  try {
    const { Task } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');

    if (!taskId || isNaN(parseInt(taskId))) {
      return NextResponse.json({ error: 'Valid task ID is required' }, { status: 400 });
    }

    const task = await Task.findByPk(parseInt(taskId));
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await task.destroy();

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
