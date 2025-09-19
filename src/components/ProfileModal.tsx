"use client";
import React from "react";

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
};

export default function ProfileModal({ open, onClose, user }: ProfileModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#111219]/95 p-6 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-scaleIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-sm bg-white/10 hover:bg-white/15 border border-white/10"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Name</div>
            <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2">
              {user?.name ?? "-"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Email</div>
            <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2">
              {user?.email ?? "-"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Role</div>
            <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2">
              {user?.role ?? "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
