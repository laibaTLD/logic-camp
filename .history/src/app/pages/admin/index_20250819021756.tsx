"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  isApproved: boolean;
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      fetchUsers(data.token);
    } else {
      setError(data.message);
    }
  };

  const fetchUsers = async (authToken: string) => {
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  };

  const approveUser = async (userId: number) => {
    const res = await fetch(`/api/admin/users?id=${userId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers(users.map(u => u.id === userId ? { ...u, isApproved: true } : u));
    }
  };

  if (!token) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl mb-4">Admin Login</h1>
        <form onSubmit={login} className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2"
            required
          />
          <button type="submit" className="bg-blue-600 text-white p-2 mt-2">
            Login
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl mb-4">Pending Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id} className="flex justify-between border p-2 mb-2">
            <span>{user.name} ({user.email})</span>
            {user.isApproved ? (
              <span className="text-green-600">Approved</span>
            ) : (
              <button
                className="bg-green-600 text-white px-2"
                onClick={() => approveUser(user.id)}
              >
                Approve
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
