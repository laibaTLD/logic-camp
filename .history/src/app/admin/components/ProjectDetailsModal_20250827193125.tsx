"use client";

import { useState, useEffect } from "react";

interface ProjectDetailsModalProps {
  projectId: number | null;
  open: boolean;
  onClose: () => void;
}

export default function ProjectDetailsModal({
  projectId,
  open,
  onClose,
}: ProjectDetailsModalProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch project details
  useEffect(() => {
    if (projectId && open) {
      setLoading(true);
      fetch(`/api/admin/projects/${projectId}`)
        .then((res) => res.json())
        .then((data) => setProject(data))
        .finally(() => setLoading(false));
    }
  }, [projectId, open]);

  // Handle delete
  const handleDelete = async () => {
    if (!projectId) return;
    const confirmed = confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    await fetch(`/api/admin/projects/${projectId}`, {
      method: "DELETE",
    });

    onClose(); // close modal after deletion
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-[#1a1a1f] text-white rounded-2xl shadow-xl p-6 w-full max-w-3xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-4">
          {project?.name || "Loading..."}
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading project details...</p>
        ) : (
          <>
            {/* Project Info */}
            <div className="space-y-2 mb-4">
              <p>
                <span className="font-semibold">Description:</span>{" "}
                {project?.description || "No description"}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {project?.status}
              </p>
              <p>
                <span className="font-semibold">Priority:</span>{" "}
                {project?.priority}
              </p>
              <p>
                <span className="font-semibold">Start:</span>{" "}
                {project?.startDate}
              </p>
              <p>
                <span className="font-semibold">End:</span> {project?.endDate}
              </p>
            </div>

            {/* Team Members */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Team Members</h3>
              <ul className="space-y-1">
                {project?.members?.length > 0 ? (
                  project.members.map((m: any) => (
                    <li
                      key={m.id}
                      className="flex justify-between border-b border-gray-700 pb-1"
                    >
                      <span>
                        {m.user?.name} ({m.role})
                      </span>
                      <span className="text-sm text-gray-400">
                        {m.isActive ? "Active" : "Inactive"}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-400">No members assigned yet.</p>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => alert("Edit project coming soon...")}
                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition"
              >
                ✏️ Edit Project
              </button>
              <button
                onClick={() => alert("Add task/member coming soon...")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
              >
                ➕ Add Task/Member
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition"
              >
                ❌ Delete Project
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
