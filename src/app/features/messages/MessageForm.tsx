"use client";

import React, { useState } from "react";

interface MessageFormProps {
  onSend: (messageText: string) => void;
}

export default function MessageForm({ onSend }: MessageFormProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;
    onSend(message);
    setMessage(""); // Clear input
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center border-t border-gray-200 p-3 bg-gray-50"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Send
      </button>
    </form>
  );
}
