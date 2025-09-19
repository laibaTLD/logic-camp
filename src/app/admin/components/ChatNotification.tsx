'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Bell } from 'lucide-react';

interface ChatNotificationProps {
  message: {
    id: number;
    content: string;
    sender: {
      name: string;
      role: string;
    };
    chatType: 'individual' | 'group';
    createdAt: string;
  };
  onClose: () => void;
  onOpenChat: () => void;
}

export default function ChatNotification({ message, onClose, onOpenChat }: ChatNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">
                {message.sender.name}
              </span>
              <span className="text-xs text-slate-400">
                {message.chatType === 'group' ? 'in Global Chat' : 'sent you a message'}
              </span>
            </div>
            
            <p className="text-sm text-slate-300 line-clamp-2 mb-2">
              {message.content}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {formatTime(message.createdAt)}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenChat}
                  className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-500/30 transition-colors"
                >
                  Open Chat
                </button>
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="p-1 hover:bg-slate-700/50 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
