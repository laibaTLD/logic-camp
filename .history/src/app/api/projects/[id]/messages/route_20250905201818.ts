import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
// Add type declaration for multer
declare module 'multer';
import path from 'path';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';
import { getIO } from '@/lib/socket';
import { randomUUID } from 'crypto';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + randomUUID();
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const { ProjectMessage, User } = await getModels();
    const projectId = parseInt(resolvedParams.id);

    const messages = await ProjectMessage.findAll({
      where: { projectId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']]
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('Get project messages error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const formData = await req.formData();
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    let attachmentUrl = null;
    if (file) {
      const uniqueSuffix = Date.now() + '-' + randomUUID();
      const filename = uniqueSuffix + path.extname(file.name);
      // Note: In production, save to storage like S3, here simulating with public folder
      attachmentUrl = `/uploads/${filename}`;
      // Simulate save: in real, use fs to write file
    }

    const { ProjectMessage, User } = await getModels();
    const projectId = parseInt(resolvedParams.projectId);

    const newMessage = await ProjectMessage.create({
      content,
      senderId: user.userId,
      projectId,
      attachmentUrl: attachmentUrl || undefined
    });

    const messageWithSender = await ProjectMessage.findByPk(newMessage.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }]
    });

    getIO().to(`project_${projectId}`).emit('newMessage', messageWithSender);

    return NextResponse.json({ message: 'Message sent', data: messageWithSender });
  } catch (err) {
    console.error('Send project message error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};