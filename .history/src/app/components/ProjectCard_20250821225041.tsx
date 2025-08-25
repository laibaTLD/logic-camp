"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { truncateText, formatDate } from "../../utils/helpers";

interface ProjectCardProps {
  id: string; // 👈 project id is required for navigation
  title: string;
  description: string;
  dueDate: string;
  membersCount: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  dueDate,
  membersCount,
}) => {
  const router = useRouter();

  const handleViewTasks = () => {
    // Navigate to project tasks page
    router.push(`/admin/projects/${id}/tasks`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition duration-200">
      {/* Project Title */}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-1">
        {truncateText(description, 100)}
      </p>

      {/* Footer: Due Date & Members */}
      <div className="flex justify-between items-center mt-4 text-gray-500 text-sm">
        <span className="flex items-center gap-1">
          📅 {formatDate(dueDate)}
        </span>
        <span className="flex items-center gap-1">
          👥 {membersCount} members
        </span>
      </div>

      {/* View/Add Tasks Button */}
      <button
        type="button"
        onClick={handleViewTasks}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        View / Add Tasks
      </button>
    </div>
  );
};

export default ProjectCard;
