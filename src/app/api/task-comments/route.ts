import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';
import { getIO } from '@/lib/socket';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const taskIdParam = searchParams.get('taskId');
    if (!taskIdParam) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }
    const taskId = parseInt(taskIdParam, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid taskId' }, { status: 400 });
    }

    const { TaskComment, User } = await getModels();
    const comments = await TaskComment.findAll({
      where: { task_id: taskId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']],
    });
    return NextResponse.json({ comments });
  } catch (err) {
    console.error('Get task comments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    let taskId: number | null = null;
    let commentText: string | null = null;
    let filesJson: any = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      taskId = parseInt((formData.get('taskId') as string) || '', 10);
      commentText = (formData.get('comment') as string) || null;
      const filesField = formData.getAll('files');
      if (filesField && filesField.length > 0) {
        filesJson = filesField.map((f: any) => ({ name: f?.name || 'file', url: `/uploads/${f?.name || 'file'}` }));
      }
    } else {
      const body = await req.json();
      taskId = parseInt(body.taskId, 10);
      commentText = body.comment ?? null;
      filesJson = body.files ?? null;
    }

    if (!taskId || isNaN(taskId)) {
      return NextResponse.json({ error: 'Valid taskId is required' }, { status: 400 });
    }
    if ((commentText === null || commentText === '') && !filesJson) {
      return NextResponse.json({ error: 'Either comment or files must be provided' }, { status: 422 });
    }

    const { TaskComment, User } = await getModels();
    const newComment = await TaskComment.create({
      task_id: taskId,
      user_id: user.userId,
      comment: commentText,
      files: filesJson,
    });

    const created = await TaskComment.findByPk(newComment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
    });

    try {
      getIO().to(`task_${taskId}`).emit('newTaskComment', created);
    } catch (e) {
      console.warn('Socket emit skipped (not initialized)');
    }

    return NextResponse.json({ comment: created }, { status: 201 });
  } catch (err) {
    console.error('Create task comment error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};


