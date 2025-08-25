"use client";

import React from "react";
import { truncateText, formatDate } from "../../utils/helpers";
// Optional: If using lucide-react, uncomment and install
// import { Calendar, Users } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  dueDate: string;
  membersCount: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  dueDate,
  membersCount,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition duration-200">
      {/* Project Title */}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-1">{truncateText(description, 100)}</p>

      {/* Footer: Due Date & Members */}
      <div className="flex justify-between items-center mt-4 text-gray-500 text-sm">
        <span className="flex items-center gap-1">
          {/* Replace with icon if lucide-react installed */}
          {/* <Calendar size={16} /> */}
          📅 {formatDate(dueDate)}
        </span>
        <span className="flex items-center gap-1">
          {/* Replace with icon if lucide-react installed */}
          {/* <Users size={16} /> */}
          👥 {membersCount} members
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
