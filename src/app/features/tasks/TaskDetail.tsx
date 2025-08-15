"use client";

import React from "react";

interface TaskDetailProps {
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  title,
  description,
  status,
  dueDate,
}) => {
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
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      {/* Task Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>

      {/* Description */}
      <p className="text-gray-600 mb-4">{description}</p>

      {/* Status */}
      <span
        className={`inline-block mb-4 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
      >
        {status}
      </span>

      {/* Due Date */}
      <p className="text-sm text-gray-500">
        <strong>Due Date:</strong> {dueDate}
      </p>
    </div>
  );
};

export default TaskDetail;
