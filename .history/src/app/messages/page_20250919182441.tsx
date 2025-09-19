"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { MessageCircle, Users, Send, Search, Phone, Video } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface IMessage {
  id: number;
  content: string;
  senderId: number;
  receiverId?: number;
  chatType: "individual" | "group";
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

type SelectedChat = { type: "individual" | "group"; id: string; user?: IUser } | null;

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedChat, setSelectedChat] = useState<SelectedChat>(null);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [typingState, setTypingState] = useState<{ active: boolean; names: string[] }>({ active: false, names: [] });

  const authToken = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("authToken") : null),
    []
  );

  // Initialize socket connection for the user
  useEffect(() => {
    if (!user?.userId) return;
    // Ensure socket server is initialized (best-effort)
    fetch('/api/socket-bootstrap').catch(() => {});
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    s.on("connect", () => {
      setIsConnected(true);
      s.emit("joinUser", user.userId);
    });
    s.on("disconnect", () => setIsConnected(false));
    s.on("newMessage", (message: IMessage) => {
      const isForCurrentChat = selectedChat
        ? message.chatType === "group"
          ? selectedChat.type === "group"
          : (selectedChat.type === "individual" &&
            ((message.senderId === selectedChat.user?.id && user.userId === message.receiverId) ||
              (message.receiverId === selectedChat.user?.id && user.userId === message.senderId)))
        : false;

      setMessages((prev) => (isForCurrentChat ? [...prev, message] : prev));

      // Track unread when not sent by current user and not in the current chat
      if (message.senderId !== user.userId && !isForCurrentChat) {
        const key = message.chatType === "group" ? "group" : String(message.senderId);
        setUnread((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        // Toast notification for new message
        toast.custom(
          (t) => (
            <div className={`pointer-events-auto w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg ${t.visible ? 'animate-in fade-in slide-in-from-top-2' : 'animate-out fade-out slide-out-to-top-2'}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">New message</div>
                  <div className="text-xs text-gray-600 truncate">{message.sender?.name || 'Someone'}: {message.content}</div>
                </div>
              </div>
            </div>
          ),
          { duration: 3000 }
        );
      }
    });

    // Typing events
    s.on('typing', (payload: { senderId: number; senderName?: string; chatType: 'individual' | 'group' }) => {
      if (!selectedChat) return;
      if (payload.senderId === user.userId) return;
      const relevant = selectedChat.type === payload.chatType;
      if (!relevant) return;
      setTypingState((prev) => {
        const name = payload.senderName || 'Someone';
        const names = prev.names.includes(name) ? prev.names : [...prev.names, name];
        return { active: true, names };
      });
    });
    s.on('stopTyping', (payload: { senderId: number; chatType: 'individual' | 'group' }) => {
      if (!selectedChat) return;
      const relevant = selectedChat.type === payload.chatType;
      if (!relevant) return;
      setTypingState((prev) => {
        // For simplicity, clear all when any stopTyping arrives for this chat
        return { active: false, names: [] };
      });
    });
    setSocket(s);
    return () => {
      s.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, selectedChat?.type, selectedChat?.user?.id]);

  // Fetch users to start 1:1 chats
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!authToken) {
          console.error("No authentication token available");
          return;
        }
        
        const res = await fetch("/api/user/contacts", {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data.users) ? data.users : []);
        } else {
          console.error(`Failed to load users: ${res.status}`);
        }
      } catch (e) {
        console.error("Failed to load users", e);
      }
    };
    if (!loading) fetchUsers();
  }, [loading, authToken]);

  // Load messages when switching chats
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;
      try {
        const params = new URLSearchParams({ chatId: selectedChat.id, type: selectedChat.type });
        const res = await fetch(`/api/messages?${params.toString()}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          const key = selectedChat.type === "group" ? "group" : selectedChat.id;
          setUnread((prev) => ({ ...prev, [key]: 0 }));
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    };
    loadMessages();
  }, [selectedChat, authToken]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredUsers = useMemo(
    () => users.filter((u) => u.id !== user?.userId && u.name.toLowerCase().includes(search.toLowerCase())),
    [users, user?.userId, search]
  );

  const send = async () => {
    if (!text.trim() || !selectedChat) return;
    try {
      const body: any = {
        content: text,
        chatId: selectedChat.id,
        chatType: selectedChat.type,
      };
      if (selectedChat.type === "individual" && selectedChat.user?.id) {
        body.receiverId = selectedChat.user.id;
      }
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setText("");
        // Emit stopTyping after sending
        if (socket) {
          socket.emit('stopTyping', {
            chatType: selectedChat.type,
            receiverId: selectedChat.type === 'individual' ? selectedChat.user?.id : undefined,
            senderId: user?.userId,
          });
        }
      }
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Emit typing on input changes with debounce to stopTyping
  const handleInputChange = (val: string) => {
    setText(val);
    if (!socket || !selectedChat || !user?.userId) return;
    // Emit typing immediately
    socket.emit('typing', {
      chatType: selectedChat.type,
      receiverId: selectedChat.type === 'individual' ? selectedChat.user?.id : undefined,
      senderId: user.userId,
      senderName: (user as any)?.email || 'User',
    });
    // Debounce stopTyping
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        chatType: selectedChat.type,
        receiverId: selectedChat.type === 'individual' ? selectedChat.user?.id : undefined,
        senderId: user.userId,
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-white">Messages</h1>
      <div className="flex h-[70vh] bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-slate-700/50 bg-slate-900/50 flex flex-col">
          <div className="p-3 border-b border-slate-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Global */}
            <button
              onClick={() => setSelectedChat({ type: "group", id: "global" })}
              className={`w-full p-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 ${
                selectedChat?.type === "group" ? "bg-indigo-500/20 border-l-2 border-l-indigo-500" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">Global Chat</div>
                  <div className="text-xs text-slate-400">Everyone</div>
                </div>
                {unread.group > 0 && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unread.group}
                  </div>
                )}
              </div>
            </button>

            {/* Individual */}
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedChat({ type: "individual", id: String(u.id), user: u })}
                className={`w-full p-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 ${
                  selectedChat?.user?.id === u.id ? "bg-indigo-500/20 border-l-2 border-l-indigo-500" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">{u.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{u.name}</div>
                    <div className="text-xs text-slate-400 truncate">{u.email}</div>
                  </div>
                  {unread[u.id] > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unread[u.id]}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      {selectedChat.type === "group" ? (
                        <Users className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-xs font-semibold text-white">
                          {selectedChat.user?.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {selectedChat.type === "group" ? "Global Chat" : selectedChat.user?.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {selectedChat.type === "group" ? "Everyone" : selectedChat.user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs px-2 py-1 rounded ${isConnected ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </div>
                    <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                      <Phone className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                      <Video className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === user?.userId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${m.senderId === user?.userId ? "order-2" : "order-1"}`}>
                      {m.senderId !== user?.userId && (
                        <div className="text-xs text-slate-400 mb-1 px-2">{m.sender.name}</div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          m.senderId === user?.userId
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                            : "bg-slate-700/50 text-white"
                        }`}
                      >
                        <div className="text-sm">{m.content}</div>
                        <div className={`text-xs mt-1 ${m.senderId === user?.userId ? "text-indigo-100" : "text-slate-400"}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                {typingState.active && (
                  <div className="text-xs text-slate-400 px-2">
                    {typingState.names.join(', ')} {typingState.names.length > 1 ? 'are' : 'is'} typing...
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
                  />
                  <button
                    onClick={send}
                    disabled={!text.trim()}
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
    </div>
  );
}
