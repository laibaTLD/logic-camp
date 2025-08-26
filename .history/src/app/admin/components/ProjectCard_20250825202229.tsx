// components/ProjectCard.tsx
"use client";

export default function ProjectCard({ project }: any) {
  return (
    <div className="border rounded-lg p-4 bg-black shadow">
      <h3 className="font-semibold">{project.name}</h3>
      <p className="text-sm text-gray-600">{project.description}</p>
      <div className="flex gap-2 mt-3">
        <button className="bg-green-500 text-black px-3 py-1 rounded">
          View / Add Tasks
        </button>
        <button className="bg-orange-500 text-black px-3 py-1 rounded">
          Edit Project
        </button>
      </div>
    </div>
  );
}
