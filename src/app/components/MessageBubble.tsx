"use client";

import React from "react";

interface MessageBubbleProps {
  sender: string;
  text: string;
  time: string;
  isOwnMessage?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  text,
  time,
  isOwnMessage = false,
}) => {
  return (
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
};

export default MessageBubble;
