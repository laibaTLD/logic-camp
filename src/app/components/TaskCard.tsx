"use client";

import React from "react";
// Optional: If you install lucide-react, you can replace emojis with icons
// import { CheckSquare, Clock } from "lucide-react";

interface TaskCardProps {
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, status, dueDate }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition duration-200">
      {/* Task Title */}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

      {/* Status */}
      <span
        className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
      >
        {status}
      </span>

      {/* Due Date */}
      <div className="mt-4 flex items-center gap-1 text-sm text-gray-500">
        {/* <Clock size={16} /> */}
        ⏰ {dueDate}
      </div>
    </div>
  );
};

export default TaskCard;
