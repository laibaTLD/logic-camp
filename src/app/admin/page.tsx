"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("member");

  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjects, setShowProjects] = useState(false);

  const router = useRouter();
  const TOKEN_KEY = "adminToken";

  // ----------------------
  // Fetch users
  // ----------------------
  const fetchUsers = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return router.push("/admin/login");

    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem(TOKEN_KEY);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

 
  // ----------------------
// Fetch projects
// ----------------------
const fetchProjects = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return router.push("/admin/login");

  try {
    const res = await fetch("/api/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ include token
      },
    });
    if (!res.ok) throw new Error("Failed to fetch projects");
    const data = await res.json();
    setProjects(data);
  } catch (err) {
    console.error(err);
  }
};

  // ----------------------
  // Approve user
  // ----------------------
  const approveUser = async (id: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to approve user");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------
  // Reject user
  // ----------------------
  const rejectUser = async (id: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to reject user");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: false } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------
  // Delete user
  // ----------------------
  const deleteUser = async (id: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------
  // Start editing user
  // ----------------------
  const startEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  // ----------------------
  // Save edited user
  // ----------------------
  const saveEdit = async () => {
    if (!editingUser) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingUser.id,
          name: editName,
          email: editEmail,
          role: editRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to save changes");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: editName, email: editEmail, role: editRole }
            : u
        )
      );
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditName("");
    setEditEmail("");
    setEditRole("member");
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    router.push("/admin/login");
  };

  const handleCreateProject = () => {
    router.push("/admin/create-project");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <button
        onClick={handleLogout}
        style={{
          marginBottom: "1rem",
          background: "red",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Logout
      </button>

      {/* Create Project Button */}
      <button
        onClick={handleCreateProject}
        style={{
          marginBottom: "1rem",
          background: "green",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "5px",
          marginLeft: "1rem",
        }}
      >
        Create Project
      </button>

      {/* Show All Projects Button */}
      <button
        onClick={() => {
          if (!showProjects) fetchProjects();
          setShowProjects(!showProjects);
        }}
        style={{
          marginBottom: "1rem",
          background: "blue",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "5px",
          marginLeft: "1rem",
        }}
      >
        {showProjects ? "Hide Projects" : "Show All Projects"}
      </button>

      {/* Users Table */}
      <table
        border={1}
        cellPadding={10}
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                      <option value="teamLead">Team Lead</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>{user.isApproved ? "Yes" : "No"}</td>
                <td>
                  {editingUser?.id === user.id ? (
                    <>
                      <button onClick={saveEdit} style={{ marginRight: "0.5rem" }}>
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ background: "gray", color: "white" }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {!user.isApproved && (
                        <button
                          onClick={() => approveUser(user.id)}
                          style={{ marginRight: "0.5rem" }}
                        >
                          Approve
                        </button>
                      )}
                      {user.isApproved && (
                        <button
                          onClick={() => rejectUser(user.id)}
                          style={{ background: "orange", marginRight: "0.5rem" }}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(user)}
                        style={{ marginRight: "0.5rem" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        style={{ background: "red", color: "white" }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Projects Section */}
      {showProjects && (
        <div style={{ marginTop: "2rem" }}>
          <h2>All Projects</h2>
          {projects.length === 0 ? (
            <p>No projects yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    background: "#fff",
                  }}
                >
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => alert(`View/Add Tasks for project ${project.id}`)}
                      style={{
                        background: "green",
                        color: "white",
                        padding: "0.5rem 1rem",
                        border: "none",
                        borderRadius: "5px",
                      }}
                    >
                      View / Add Tasks
                    </button>
                    <button
                      onClick={() => alert(`Edit project ${project.id}`)}
                      style={{
                        background: "orange",
                        color: "white",
                        padding: "0.5rem 1rem",
                        border: "none",
                        borderRadius: "5px",
                      }}
                    >
                      Edit Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
