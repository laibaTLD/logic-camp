"use client";

import { useRouter } from "next/navigation";

export default function Header({ router, fetchProjects, showProjects }: any) {
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  const handleCreateProject = () => {
    router.push("/admin/create-project");
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>

      <button
        onClick={handleCreateProject}
        className="bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        Create Project
      </button>

      <button
        onClick={fetchProjects}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        {showProjects ? "Hide Projects" : "Show All Projects"}
      </button>
    </div>
  );
}
