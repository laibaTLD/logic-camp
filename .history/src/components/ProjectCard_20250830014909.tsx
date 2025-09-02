import React from 'react';
import Link from 'next/link';

type Project = {
  id: number;
  name: string;
  description: string;
  // Add other fields as needed
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white/5 p-4 rounded-lg shadow-md hover:bg-white/10 transition-colors border border-white/10">
        <h3 className="text-lg font-semibold mb-2 text-white">{project.name}</h3>
        <p className="text-gray-300">{project.description}</p>
      </div>
    </Link>
  );
}