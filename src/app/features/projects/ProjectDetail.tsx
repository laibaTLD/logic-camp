"use client";

import React from "react";

interface ProjectDetailProps {
  title: string;
  description: string;
  dueDate: string;
  members: { id: string; name: string }[];
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  title,
  description,
  dueDate,
  members,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      {/* Project Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>

      {/* Description */}
      <p className="text-gray-600 mb-4">{description}</p>

      {/* Due Date */}
      <p className="text-sm text-gray-500 mb-4">
        <strong>Due Date:</strong> {dueDate}
      </p>

      {/* Members List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Members</h3>
        {members.length > 0 ? (
          <ul className="list-disc list-inside text-gray-600">
            {members.map((member) => (
              <li key={member.id}>{member.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No members assigned yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
