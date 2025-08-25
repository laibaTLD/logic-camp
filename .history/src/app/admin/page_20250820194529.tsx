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

const TOKEN_KEY = "adminToken";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  // 🔒 Protect Admin Dashboard
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const decoded: any = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role !== "admin") {
        // ❌ Not an admin
        localStorage.removeItem(TOKEN_KEY);
        router.push("/admin/login");
        return;
      }
      setAuthenticated(true);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem(TOKEN_KEY);
      router.push("/admin/login");
    }
  }, [router]);

  // ✅ Fetch all users if authenticated
  useEffect(() => {
    if (!authenticated) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch users");
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authenticated]);

  if (!authenticated) return <p>Redirecting...</p>;
  if (loading) return <p>Loading users...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Approved</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isApproved ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
