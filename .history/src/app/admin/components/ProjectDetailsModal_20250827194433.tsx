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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0b0b10] text-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-4">
          {loading ? "Loading..." : project?.name}
        </h2>

        {/* Project Info */}
        {loading ? (
          <p className="text-gray-400">Fetching project details...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <p>
                <span className="font-semibold text-gray-300">Description:</span>{" "}
                {project?.description || "No description"}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Status:</span>{" "}
                {project?.status || "—"}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Priority:</span>{" "}
                {project?.priority || "—"}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Start:</span>{" "}
                {project?.startDate || "—"}
              </p>
              <p>
                <span className="font-semibold text-gray-300">End:</span>{" "}
                {project?.endDate || "—"}
              </p>
            </div>

            {/* Team Members */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-200">
                Team Members
              </h3>
              <div className="bg-[#1a1a1f] rounded-xl p-3 border border-gray-700">
                {project?.members?.length > 0 ? (
                  <ul className="space-y-2">
                    {project.members.map((m: any) => (
                      <li
                        key={m.id}
                        className="flex justify-between text-sm border-b border-gray-700 pb-2"
                      >
                        <span>
                          {m.user?.name} <span className="text-gray-400">({m.role})</span>
                        </span>
                        <span
                          className={`${
                            m.isActive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {m.isActive ? "Active" : "Inactive"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No members assigned yet.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
                onClick={() => alert("Edit Project / Add Task coming soon...")}
              >
                ✏️ Edit Project / New Task
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition"
                onClick={handleDelete}
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
