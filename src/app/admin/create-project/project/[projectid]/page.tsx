"use client";

import { useRouter } from "next/navigation";
import TaskForm from "./taskform";
import TaskList from "./tasklist";

interface ProjectPageProps {
  params: { projectId: string };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const projectId = parseInt(params.projectId, 10);
  const router = useRouter();

  const handleBackToProjects = () => {
    router.push("/admin/projects"); // navigate back to all projects page
  };

  return (
    <div className="p-4">
      {/* Back button */}
      <button
        onClick={handleBackToProjects}
        style={{
          marginBottom: "1rem",
          background: "gray",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "5px",
        }}
      >
        ← Back to All Projects
      </button>

      <h1 className="text-2xl font-bold mb-4">Project Details</h1>

      {/* Task creation */}
      <TaskForm projectId={projectId} onTaskCreated={() => {}} />

      {/* Task list */}
      <TaskList projectId={projectId} />
    </div>
  );
}
