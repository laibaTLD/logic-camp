"use client";

import { useState, useEffect } from "react";
import UserRow from "./UserRow";

export default function UserTable() {
  const [users, setUsers] = useState<any[]>([]);

  // Fetch users
  
const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token"); // this must exist after login

    const res = await fetch("http://localhost:3000/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    setUsers(data.users); // make sure your API returns { users: [...] }
  } catch (error) {
    console.error("Error: Failed to fetch users", error);
  }
};

    // ✅ handles both shapes
    if (Array.isArray(data)) {
      setUsers(data);
    } else if (data.users && Array.isArray(data.users)) {
      setUsers(data.users);
    } else {
      setUsers([]); // fallback
    }
  } catch (err) {
    console.error("Fetch users error:", err);
    setUsers([]);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/20 text-left text-sm md:text-base">
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4">Approved</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <UserRow key={idx} user={user} onRefresh={fetchUsers} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
