import React from 'react';

type Project = {
  id: number;
  name: string;
  description: string;
  // Add other fields as needed
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
      <p className="text-gray-600">{project.description}</p>
    </div>
  );
}