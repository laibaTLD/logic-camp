"use client";

import React from "react";

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwnMessage?: boolean;
}

const MessageBubble = ({
  sender,
  text,
  time,
  isOwnMessage = false,
}: {
  sender: string;
  text: string;
  time: string;
  isOwnMessage?: boolean;
}) => (
  <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm border text-sm
        ${isOwnMessage ? "bg-blue-600 text-white border-blue-700" : "bg-white text-gray-800 border-gray-200"}
      `}
    >
      <div className={`mb-1 text-xs ${isOwnMessage ? "opacity-90" : "text-gray-500"}`}>
        {sender} • {time}
      </div>
      <div className="whitespace-pre-wrap break-words">{text}</div>
    </div>
  </div>
);

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (!messages || messages.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-6">
        No messages yet. Start the conversation!
      </p>
    );
  }

  return (
    <div className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto max-h-[400px]">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          sender={msg.sender}
          text={msg.text}
          time={msg.time}
          isOwnMessage={msg.isOwnMessage}
        />
      ))}
    </div>
  );
};

export default MessageList;
