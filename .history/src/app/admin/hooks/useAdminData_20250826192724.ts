"use client";

import { useState } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
}

export default function useAdminData() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "Alice", email: "alice@example.com", role: "Employee", isApproved: false },
    { id: 2, name: "Bob", email: "bob@example.com", role: "TeamLead", isApproved: true },
  ]);

  const approveUser = (id: number) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, isApproved: true } : user
      )
    );
  };

  const rejectUser = (id: number) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, isApproved: false } : user
      )
    );
  };

  const deleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const editUser = (id: number) => {
    alert(`Editing user with ID: ${id}`);
  };

  return { users, approveUser, rejectUser, deleteUser, editUser };
}
