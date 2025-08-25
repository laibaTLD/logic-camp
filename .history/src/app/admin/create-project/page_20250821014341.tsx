"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User { id: number; name: string; email: string }

export default function CreateProject() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const TOKEN_KEY = "adminToken";

  const isTokenExpired = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  // Example: set a token manually (for testing)
  // In real app, this should come from login page
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      // ⚡ Simulate login token storage
      // localStorage.setItem(TOKEN_KEY, "<PASTE_YOUR_JWT_HERE>");
      console.warn("No token found. Please log in first.");
      router.push("/admin/login");
      return;
    }

    if (isTokenExpired(savedToken)) {
      localStorage.removeItem(TOKEN_KEY);
      router.push("/admin/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setUsers(data.users || data);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        router.push("/admin/login");
      }
    };
    fetchUsers();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      setError("Session expired. Please log in again.");
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description, memberIds }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create project");
        setLoading(false);
        return;
      }

      // ✅ Optional: store token again if you want to refresh it
      localStorage.setItem(TOKEN_KEY, token);

      alert("Project created successfully!");
      router.push("/admin");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Create Project</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
        <input type="text" placeholder="Project Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: "0.5rem" }} />
        <textarea placeholder="Project Description" value={description} onChange={e => setDescription(e.target.value)} required style={{ padding: "0.5rem" }} />
        <div>
          <label>Team Members:</label>
          <select multiple value={memberIds.map(String)} onChange={e => setMemberIds(Array.from(e.target.selectedOptions, o => parseInt(o.value)))} style={{ width: "100%", minHeight: "100px", marginTop: "0.5rem" }}>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} style={{ background: "green", color: "white", padding: "0.5rem", border: "none", borderRadius: "5px" }}>
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
