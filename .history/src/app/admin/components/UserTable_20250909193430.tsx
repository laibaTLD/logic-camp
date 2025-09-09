"use client";

import { useMemo, useState } from "react";
import UserRow from "./UserRow";
import EditUserModal from "./EditUserModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

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
          <div className="text-sm text-slate-400">{filteredUsers.length} users</div>
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
