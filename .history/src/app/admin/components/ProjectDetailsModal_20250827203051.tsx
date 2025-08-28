"use client";

interface ProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: any) => void;
  onDelete: (project: any) => void;
  onAddTask: (project: any) => void;
}

export default function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddTask,
}: ProjectDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-[#1c1c24] text-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative">
        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
        >
          ✕
        </button>

        {/* Project title */}
        <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
        <p className="text-gray-400 mb-4">{project.description}</p>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-4">
          {/* Add Task (Plus Icon) */}
          <button
            onClick={() => onAddTask(project)}
            className="p-2 rounded-full bg-green-600 hover:bg-green-500 transition"
            title="Add Task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Edit (Pencil Icon) */}
          <button
            onClick={() => onEdit(project)}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition"
            title="Edit Project"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2.121 2.121 0 013 3L12 14H9v-3z"
              />
            </svg>
          </button>

          {/* Delete (Trash Icon) */}
          <button
            onClick={() => onDelete(project)}
            className="p-2 rounded-full bg-red-600 hover:bg-red-500 transition"
            title="Delete Project"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
