"use client";

interface ProjectDetailsModalProps {
  project: any;
  open: boolean;
  onClose: () => void;
}

export default function ProjectDetailsModal({
  project,
  open,
  onClose,
}: ProjectDetailsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-2xl rounded-2xl bg-[#111827] p-6 shadow-xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold text-white">{project.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition"
            title="Close"
          >
            {/* Close (X) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4 text-gray-300">
          <p>{project.description}</p>

          {/* Action icons */}
          <div className="flex gap-4 mt-6">
            {/* Edit */}
            <button
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition shadow-md"
              title="Edit Project"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </button>

            {/* Delete */}
            <button
              className="p-2 rounded-full bg-red-600 hover:bg-red-500 transition shadow-md"
              title="Delete Project"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>

            {/* Add Task */}
            <button
              className="p-2 rounded-full bg-green-600 hover:bg-green-500 transition shadow-md"
              title="Add Task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
