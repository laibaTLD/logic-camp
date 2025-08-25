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
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  // ✅ Fetch and verify JWT before loading users
  const fetchUsers = async () => {
    const token = localStorage.getItem("adminToken"); // fixed: use same key as login

    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      router.push("/admin/login");
      return;
    }

    try {
      // ✅ Verify token
      const verifyRes = await fetch("/api/auth/verify", {
        method
        headers: { Authorization: `Bearer ${token}` },

      });

      
      const verifyData = await verifyRes.json();
      console.log(verifyData);

      if (!verifyRes.ok || !verifyData.valid) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
        setAuthenticated(false);
        setLoading(false);
        router.push("/admin/login");
        return;
      }

      setAuthenticated(true);

      // ✅ Get users list
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id: number) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    await fetch("/api/admin/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    fetchUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!authenticated) return null; // since redirect already triggered

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

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Approved</th>
            <th>Action</th>
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
                    <button onClick={() => approveUser(user.id)}>
                      Approve
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
