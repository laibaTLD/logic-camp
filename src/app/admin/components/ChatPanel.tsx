'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  MessageCircle, 
  Users, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Bell,
  BellOff,
  MoreVertical,
  Search,
  Phone,
  Video
} from 'lucide-react';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId?: number;
  chatType: 'individual' | 'group';
  chatId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isOnline?: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export default function ChatPanel({ isOpen, onClose, currentUser }: ChatPanelProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ type: 'individual' | 'group'; id: string; user?: User } | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [notifications, setNotifications] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      newSocket.emit('joinUser', currentUser.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Add notification if not from current user
      if (message.senderId !== currentUser.id) {
        const chatKey = message.chatType === 'group' ? 'group' : message.chatId;
        setNotifications(prev => ({
          ...prev,
          [chatKey]: (prev[chatKey] || 0) + 1
        }));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [currentUser.id]);

  // Load users and messages
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        const response = await fetch('/api/users', {
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    loadUsers();
  }, []);

  // Load messages when chat changes
  useEffect(() => {
    if (selectedChat) {
      const loadMessages = async () => {
        try {
          const params = new URLSearchParams({
            chatId: selectedChat.id,
            type: selectedChat.type
          });
          
          const response = await fetch(`/api/messages?${params}`);
          if (response.ok) {
            const data = await response.json();
            setMessages(data.messages || []);
          }
        } catch (error) {
          console.error('Failed to load messages:', error);
        }
      };

      loadMessages();
    }
  }, [selectedChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !socket) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          chatId: selectedChat.id,
          chatType: selectedChat.type,
          receiverId: selectedChat.type === 'individual' ? selectedChat.user?.id : undefined
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Clear notification for this chat
        const chatKey = selectedChat.type === 'group' ? 'group' : selectedChat.id;
        setNotifications(prev => ({
          ...prev,
          [chatKey]: 0
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredUsers = users.filter(user => 
    user.id !== currentUser.id && 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Team Chat</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-slate-400">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4 text-slate-400" /> : <Minimize2 className="w-4 h-4 text-slate-400" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-slate-700/50 bg-slate-900/50">
              {/* Search */}
              <div className="p-3 border-b border-slate-700/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {/* Global Chat */}
                <button
                  onClick={() => setSelectedChat({ type: 'group', id: 'global' })}
                  className={`w-full p-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 ${
                    selectedChat?.type === 'group' ? 'bg-indigo-500/20 border-l-2 border-l-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">Global Chat</div>
                      <div className="text-xs text-slate-400">Team-wide discussions</div>
                    </div>
                    {notifications.group > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.group}
                      </div>
                    )}
                  </div>
                </button>

                {/* Individual Chats */}
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedChat({ type: 'individual', id: user.id.toString(), user })}
                    className={`w-full p-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 ${
                      selectedChat?.user?.id === user.id ? 'bg-indigo-500/20 border-l-2 border-l-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{user.name}</div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {user.isOnline && (
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                        {notifications[user.id] > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {notifications[user.id]}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                          {selectedChat.type === 'group' ? (
                            <Users className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-xs font-semibold text-white">
                              {selectedChat.user?.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {selectedChat.type === 'group' ? 'Global Chat' : selectedChat.user?.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {selectedChat.type === 'group' ? 'Team-wide discussions' : selectedChat.user?.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                          <Phone className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                          <Video className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.senderId === currentUser.id ? 'order-2' : 'order-1'}`}>
                          {message.senderId !== currentUser.id && (
                            <div className="text-xs text-slate-400 mb-1 px-2">
                              {message.sender.name}
                            </div>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              message.senderId === currentUser.id
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                : 'bg-slate-700/50 text-white'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className={`text-xs mt-1 ${
                              message.senderId === currentUser.id ? 'text-indigo-100' : 'text-slate-400'
                            }`}>
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <div className="text-slate-400 text-sm">Select a chat to start messaging</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
