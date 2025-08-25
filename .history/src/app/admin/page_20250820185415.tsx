"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  isApproved: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const TOKEN_KEY = "adminToken";

  // ----------------------
  // Fetch users
  // ----------------------
  const fetchUsers = async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        router.push("/admin/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      if (data.success) {
        setUsers(data.users); // ✅ fix
      } else {
        throw new Error(data.error || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      localStorage.removeItem(TOKEN_KEY);
      router.push("/admin/login");
    } finally {
      setLoading(false);
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
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to approve user");

      // Update UI without refetching everything
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, isApproved: true } : user))
      );
    } catch (err) {
      console.error("Approve user error:", err);
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
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to reject user");

      // Update UI
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, isApproved: false } : user))
      );
    } catch (err) {
      console.error("Reject user error:", err);
    }
  };

  // ----------------------
  // Logout
  // ----------------------
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    router.push("/admin/login");
  };

  // ----------------------
  // Load users on mount
  // ----------------------
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
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Approved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isApproved ? "Yes" : "No"}</td>
                <td>
                  {!user.isApproved && (
                    <button onClick={() => approveUser(user.id)} style={{ marginRight: "0.5rem" }}>
                      Approve
                    </button>
                  )}
                  {user.isApproved && (
                    <button onClick={() => rejectUser(user.id)} style={{ background: "orange" }}>
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
