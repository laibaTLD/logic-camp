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

  // Fetch users with token
  const fetchUsers = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      router.push("/admin/login");
      return;
    }

    try {
      const verifyRes = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.valid) {
        localStorage.removeItem("adminToken");
        setAuthenticated(false);
        setLoading(false);
        router.push("/admin/login");
        return;
      }

      setAuthenticated(true);

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
    const token = localStorage.getItem("adminToken");
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

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!authenticated) return null; // since redirect already triggered

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
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
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isApproved ? "Yes" : "No"}</td>
              <td>
                {!user.isApproved && (
                  <button onClick={() => approveUser(user.id)}>Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
