"use client";

import React, { useState } from "react";
import MessageList from "../../features/messages/MessageList";
import MessageForm from "../../features/messages/MessageForm";

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwnMessage?: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "John",
      text: "Hey, how’s the project going?",
      time: "10:30 AM",
      isOwnMessage: false,
    },
    {
      id: "2",
      sender: "Me",
      text: "Pretty good! Just finishing up the UI components.",
      time: "10:32 AM",
      isOwnMessage: true,
    },
  ]);

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "Me",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwnMessage: true,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
      </div>

      {/* Message input form */}
      <MessageForm onSend={handleSendMessage} />
    </div>
  );
}
