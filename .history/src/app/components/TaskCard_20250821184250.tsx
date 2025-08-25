"use client";

import React from "react";

interface TaskCardProps {
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate?: string;
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
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

      <span
        className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
      >
        {status}
      </span>

      <div className="mt-4 flex items-center gap-1 text-sm text-gray-500">
        ⏰ {dueDate || "No due date"}
      </div>
    </div>
  );
};

export default TaskCard;
