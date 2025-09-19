"use client";

import { useMemo, useState } from "react";
import UserRow from "./UserRow";
import EditUserModal from "./EditUserModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import React from "react";

interface UserTableProps {
  users: any[];
  loadingUsers: boolean;
  approveUser: (userId: number) => Promise<void>;
  rejectUser: (userId: number) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  editUser: (userId: number, userData: any) => Promise<void>;
}

export default function UserTable({ users, loadingUsers, approveUser, rejectUser, deleteUser, editUser }: UserTableProps) {

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center py-12 animate-fadeIn">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          <span className="animate-pulse">Loading users...</span>
        </div>
      </div>
    );
  }

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "employee" });

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    try {
      setCreateLoading(true);
      const adminToken = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('jwtToken')) : null;
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(newUser)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create user');
      }
      setCreateOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "employee" });
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.35)] animate-fadeInUp">
        {/* Search */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name or email..."
            className="w-full max-w-md px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-400">{filteredUsers.length} users</div>
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-600 to-cyan-600 px-4 sm:px-5 py-2.5 text-sm font-medium text-white hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New User
            </button>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-b border-white/10">
              <th className="p-4 text-slate-200 font-semibold">Name</th>
              <th className="p-4 text-slate-200 font-semibold">Email</th>
              <th className="p-4 text-slate-200 font-semibold">Role</th>
              <th className="p-4 text-slate-200 font-semibold">Approved</th>
              <th className="p-4 text-slate-200 font-semibold">Actions</th>
            </tr>
          </thead>
        <tbody>
          {currentUsers.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              approveUser={approveUser}
              rejectUser={rejectUser}
              deleteUser={deleteUser}
              editUser={editUser}
              onEditStart={(user) => setEditingUser(user)}
              onDeleteStart={(user) => setDeletingUser(user)}
            />
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <div className="text-sm text-slate-400">Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length}</div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-2 rounded-lg text-sm border ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed border-slate-700/50' : 'border-slate-600/50 hover:border-slate-500/50'} bg-slate-800/60 text-white`}
          >
            Prev
          </button>
          <div className="text-sm text-slate-300">Page {currentPage} of {totalPages}</div>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`px-3 py-2 rounded-lg text-sm border ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed border-slate-700/50' : 'border-slate-600/50 hover:border-slate-500/50'} bg-slate-800/60 text-white`}
          >
            Next
          </button>
        </div>
      </div>
      </div>

      {/* ✅ Modals live OUTSIDE table */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !createLoading && setCreateOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-gradient-to-b from-[#0f1220] to-[#0b0d18] text-white border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fadeInUp">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-base sm:text-lg font-semibold">Create New User</div>
              </div>
              <button onClick={() => !createLoading && setCreateOpen(false)} className="text-slate-300 hover:text-white px-2 py-1 rounded-md hover:bg-white/10">✕</button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4">
              <input
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <input
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <input
                placeholder="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="employee">Employee</option>
                <option value="teamLead">Team Lead</option>
                <option value="admin">Admin</option>
              </select>
              </div>
            </div>
            <div className="px-5 pb-5 flex items-center justify-end gap-2 border-t border-white/10">
              <button
                disabled={createLoading}
                onClick={() => setCreateOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/60 px-4 py-2.5 text-sm text-white hover:bg-slate-700/60 hover:border-slate-500/50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                disabled={createLoading || !newUser.name || !newUser.email || !newUser.password}
                onClick={createUser}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {createLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={editUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={async () => {
          if (deletingUser) {
            setIsDeleting(true);
            try {
              await deleteUser(deletingUser.id);
              setDeletingUser(null);
            } catch (error) {
              console.error("Failed to delete user:", error);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
        title="Delete User"
        message={deletingUser ? `Are you sure you want to delete ${deletingUser.name}? This action cannot be undone.` : ""}
        loading={isDeleting}
      />
    </>
  );
}
