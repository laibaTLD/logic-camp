"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import UserTable from "./components/UserTable";
import ProjectsGrid from "./components/ProjectsGrid";
import useAdminData from "./hooks/useAdminData";

export default function AdminDashboard() {
  const {
    users,
    projects,
    loading,
    showProjects,
    fetchUsers,
    fetchProjects,
    approveUser,
    rejectUser,
    deleteUser,
    saveEdit,
    cancelEdit,
    editingUser,
    editName,
    editEmail,
    editRole,
    setEditName,
    setEditEmail,
    setEditRole,
    startEdit,
  } = useAdminData();

  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-5 flex flex-col bg-gray-900 min-h-screen">
      <Header router={router} fetchProjects={fetchProjects} showProjects={showProjects} />

      {/* Users Section */}
      <UserTable
        users={users}
        approveUser={approveUser}
        rejectUser={rejectUser}
        deleteUser={deleteUser}
        startEdit={startEdit}
        saveEdit={saveEdit}
        cancelEdit={cancelEdit}
        editingUser={editingUser}
        editName={editName}
        editEmail={editEmail}
        editRole={editRole}
        setEditName={setEditName}
        setEditEmail={setEditEmail}
        setEditRole={setEditRole}
      />

      {/* Projects Section */}
      {showProjects && <ProjectsGrid projects={projects} />}
    </div>
  );
}
