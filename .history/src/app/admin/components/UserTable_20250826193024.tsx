"use client";

import { useEffect, useState } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
}

export default function useAdminData() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users"); // adjust your API route
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Fake action handlers (replace with real API calls)
  const approveUser = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u))
    );
  };

  const rejectUser = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isApproved: false } : u))
    );
  };

  const deleteUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const editUser = (id: number) => {
    console.log("Edit user", id);
  };

  return {
    users,
    loadingUsers,
    approveUser,
    rejectUser,
    deleteUser,
    editUser,
  };
}
