"use client";

import taskForm from "./taskForm";
import taskList from "./taskList";

interface ProjectPageProps {
  params: { projectId: string };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const projectId = parseInt(params.projectId, 10);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Project Details</h1>

      {/* Task creation */}
      <TaskForm projectId={projectId} onTaskCreated={() => {}} />

      {/* Task list */}
      <TaskList projectId={projectId} />
    </div>
  );
}
