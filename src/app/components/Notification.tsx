"use client";

import React from "react";
// Optional: If you install lucide-react, replace emoji with icon
// import { Bell } from "lucide-react";

interface NotificationProps {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  time?: string;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = "info",
  time,
}) => {
  const typeStyles: Record<string, string> = {
    info: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-md shadow-sm border border-gray-200 ${typeStyles[type]}`}
    >
      {/* Icon */}
      <div className="text-lg">
        {/* <Bell size={20} /> */}
        🔔
      </div>

      {/* Message & Time */}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {time && <span className="text-xs opacity-70">{time}</span>}
      </div>
    </div>
  );
};

export default Notification;
