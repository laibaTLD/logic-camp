'use client';

import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import MessageBubble from '@/app/components/MessageBubble';
import { useUser } from '@/lib/context/UserContext';
import { useToast } from '@/components/ui/use-toast';

type Message = {
  id: number;
  content: string;
  sender: { id: number; name: string };
  createdAt: string;
  attachmentUrl?: string;
};

interface ProjectChatProps {
  projectId: number;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch historical messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/messages`);
        if (!res.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await res.json();
        setMessages(data.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast({
          title: 'Error',
          description: 'Failed to load chat history.',
          variant: 'destructive',
        });
      }
    };
    fetchMessages();

    // Connect to socket
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('joinProject', projectId.toString());

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [projectId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage && !file) return;

    const formData = new FormData();
    formData.append('content', newMessage);
    if (file) formData.append('file', file);

    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Failed to send message');
      }
      setNewMessage('');
      setFile(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-96 bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden">
      {error && <div className="p-4 text-red-500">{error}</div>}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <MessageBubble
              sender={msg.sender.name}
              text={msg.content}
              time={new Date(msg.createdAt).toLocaleTimeString()}
              isOwnMessage={msg.sender.id === user?.id}
            />
            {msg.attachmentUrl && (
              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                View Attachment
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 text-white rounded px-3 py-2 border border-white/10"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-white text-xs"
          />
          <button onClick={handleSend} className="bg-indigo-600 text-white px-4 py-2 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectChat;