"use client";

import { useParams } from "next/navigation";

export default function ProjectTasksPage() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Tasks for Project {id}</h1>
      {/* Later you’ll fetch and show tasks here */}
    </div>
  );
}
