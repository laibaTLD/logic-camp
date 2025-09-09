// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'inProgress', 'testing', 'completed']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().nullable().optional(), // parse manually to Date
  assignedToId: z.number().nullable().optional(), // Keep for backward compatibility
  assigneeIds: z.array(z.number()).optional(), // New field for multiple assignees
  estimatedHours: z.number().min(0).nullable().optional(),
  goalId: z.number().min(1, 'Goal ID is required'),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.number().min(1, 'Task ID is required'),
});

// --------------------
// GET /api/tasks - Get all tasks for authenticated user, optionally filtered by goalId
// --------------------
export async function GET(req: NextRequest) {
  try {
    const { Task, User, Goal } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    // Get goalId from query parameters
    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get('goalId');

    // Build where clause
    const whereClause: any = {};
    if (goalId) {
      const goalIdNum = parseInt(goalId, 10);
      if (isNaN(goalIdNum)) {
        return NextResponse.json({ error: 'Invalid goalId parameter' }, { status: 400 });
      }
      whereClause.goal_id = goalIdNum;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: Goal, as: 'goal', attributes: ['id', 'title', 'status'] },
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
    const { Task, User, sequelize } = await getModels();
    const TaskAssignee = sequelize.model('TaskAssignee');

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    const body = await req.json();
    const validatedData = createTaskSchema.parse(body);

    // Verify goal exists
    const { Goal } = await getModels();
    const goal = await Goal.findByPk(validatedData.goalId);
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
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
        description: validatedData.description ?? undefined,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        goal_id: validatedData.goalId,
        assigned_to: assigneeIds.length > 0 ? assigneeIds[0] : undefined, // Keep first assignee for backward compatibility
        estimated_hours: validatedData.estimatedHours ?? undefined,
        created_by: payload.userId,
      }, { transaction: t });

      // Ensure task is saved and get the ID
      await task.save({ transaction: t });
      const taskId = task.dataValues.id || task.id;

      // Create task assignee records
      if (assigneeIds.length > 0 && taskId) {
        const taskAssignees = assigneeIds.map(userId => ({
          taskId: taskId,
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
        { model: Goal, as: 'goal', attributes: ['id', 'title', 'status'] },
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
    const { Task, User, Project } = await getModels();

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
      due_date: validatedData.dueDate ? new Date(validatedData.dueDate) : task.due_date,
      assignedToId: (validatedData.assigneeIds !== undefined || validatedData.assignedToId !== undefined) 
        ? (assigneeIds.length > 0 ? assigneeIds[0] : null) 
                : task.assigned_to,
      estimated_hours: validatedData.estimatedHours ?? task.estimated_hours,

      goal_id: validatedData.goalId ?? task.goal_id,
    });

    // Update task assignees if specified
    if (validatedData.assigneeIds !== undefined || validatedData.assignedToId !== undefined) {
      // Remove existing assignees
      await sequelize.model('TaskAssignee').destroy({ where: { taskId: task.id } });
      
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
        { model: Goal, as: 'goal', attributes: ['id', 'title', 'status'] },
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
