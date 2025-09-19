'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Send, Search, Phone, Video, Info, Clock } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId?: number;
  chatType: 'individual' | 'group';
  chatId: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface MessagesSectionProps {
  currentUser: any;
  onOpenChat: () => void;
}

export default function MessagesSection({ currentUser, onOpenChat }: MessagesSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch users for individual chats
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Try to get the auth token first, then fall back to adminToken if needed
        const authToken = localStorage.getItem('authToken');
        const adminToken = localStorage.getItem('adminToken');
        const token = authToken || adminToken;
        
        const response = await fetch('/api/users', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for session-based auth
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          console.error(`Failed to fetch users: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const adminToken = localStorage.getItem('adminToken');
        const response = await fetch('/api/messages', {
          headers: {
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const sendMessage = async (content: string, receiverId?: number) => {
    if (!content.trim()) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          content,
          receiverId,
          chatType: receiverId ? 'individual' : 'group',
          chatId: receiverId ? `individual-${Math.min(currentUser.id, receiverId)}-${Math.max(currentUser.id, receiverId)}` : 'group-global',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Refresh messages
        const messagesResponse = await fetch('/api/messages', {
          headers: {
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
        });
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data.messages || []);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendMessage = () => {
    if (selectedChat && selectedChat.startsWith('individual-')) {
      const receiverId = parseInt(selectedChat.split('-')[2]);
      sendMessage(newMessage, receiverId);
    } else {
      sendMessage(newMessage);
    }
  };

  const filteredUsers = users.filter(user => 
    user.id !== currentUser?.id && 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentMessages = messages.slice(-20).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Messages</h1>
        <button
          onClick={onOpenChat}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 text-sm text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <MessageCircle className="w-4 h-4" />
          Open Chat Panel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Start Individual Chat</h3>
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedChat(`individual-${user.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-xl flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {selectedChat.startsWith('individual-') ? 'U' : 'G'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {selectedChat.startsWith('individual-') ? 'Individual Chat' : 'Group Chat'}
                    </div>
                    <div className="text-xs text-slate-400">Online</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <Video className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <Info className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-slate-400">Loading messages...</div>
                  </div>
                ) : recentMessages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <div className="text-slate-400">No messages yet</div>
                      <div className="text-xs text-slate-500">Start a conversation!</div>
                    </div>
                  </div>
                ) : (
                  recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderId === currentUser?.id
                            ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                            : 'bg-slate-700/50 text-slate-200'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white hover:from-purple-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <div className="text-slate-400 mb-2">Select a user to start chatting</div>
                <div className="text-xs text-slate-500">Choose from the users list to begin a conversation</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
