import { NextRequest, NextResponse } from 'next/server';
import { getIO } from '@/lib/socket';
import { Op } from 'sequelize';
import { authenticateUser } from '@/lib/auth';
import { getModels } from '@/lib/db';

// Get messages for a chat (individual or group)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const { searchParams } = new URL(request.url);
    const { User, Message } = await getModels();
    const chatId = searchParams.get('chatId');
    const chatType = searchParams.get('type') || 'individual'; // 'individual' or 'group'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!chatId) {
      // Return a recent feed for the authenticated user: recent group + individual messages involving the user
      const userId = (user as any).userId || (user as any).id;
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { chatType: 'group' },
            { chatType: 'individual', senderId: userId },
            { chatType: 'individual', receiverId: userId },
          ],
        },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });
      return NextResponse.json({ messages: messages.reverse() });
    }

    let messages;
    if (chatType === 'group') {
      // Get global/group messages
      messages = await Message.findAll({
        where: { chatType: 'group' },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });
    } else {
      // Get individual chat messages
      const userId = (user as any).userId || (user as any).id;
      const otherUserId = parseInt(chatId);
      
      messages = await Message.findAll({
        where: {
          chatType: 'individual',
          [Op.or]: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });
    }

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Send a new message
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const { content, chatId, chatType = 'individual', receiverId } = await request.json();
    const { User, Message } = await getModels();

    if (!content || !chatId) {
      return NextResponse.json({ error: 'Content and chat ID are required' }, { status: 400 });
    }

    const senderId = (user as any).userId || (user as any).id;
    let messageData: any = {
      content,
      senderId,
      chatType,
      chatId: chatType === 'group' ? 'global' : chatId
    };

    if (chatType === 'individual' && receiverId) {
      messageData.receiverId = parseInt(receiverId);
    }

    const message = await Message.create(messageData);

    // Fetch the message with sender details
    const messageWithSender = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });

    // Emit real-time message to clients (best-effort if Socket.IO is initialized)
    try {
      const io = getIO();
      if (chatType === 'group') {
        io.emit('newMessage', messageWithSender);
      } else {
        // Send to both sender and receiver
        io.to(`user_${senderId}`).emit('newMessage', messageWithSender);
        if (receiverId) {
          io.to(`user_${receiverId}`).emit('newMessage', messageWithSender);
        }
      }
    } catch (e) {
      // Socket server not initialized; proceed without real-time emit
      console.warn('Socket.IO not initialized yet; skipping emit');
    }

    return NextResponse.json({ message: messageWithSender });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
