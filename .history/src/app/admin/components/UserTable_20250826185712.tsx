"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpDown } from "lucide-react";
import UserRow from "./UserRow";
import useAdminData from "../hooks/useAdminData";

export default function UserTable() {
  const { users, loadingUsers } = useAdminData();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "email" | "role" | "status">(
    "name"
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = users?.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    ) || [];

    return list.sort((a, b) => {
      const m: Record<string, string | boolean> = {
        name: a.name,
        email: a.email,
        role: a.role,
        status: a.isApproved,
      } as any;
      const n: Record<string, string | boolean> = {
        name: b.name,
        email: b.email,
        role: b.role,
        status: b.isApproved,
      } as any;

      const av = m[sortKey];
      const bv = n[sortKey];
      if (typeof av === "boolean" && typeof bv === "boolean") {
        return Number(bv) - Number(av);
      }
      return String(av).localeCompare(String(bv));
    });
  }, [users, query, sortKey]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            className="w-full rounded-xl bg-black/30 border border-white/10 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
            placeholder="Search users by name, email, role..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
          onClick={() => {
            const order: any = ["name", "email", "role", "status"];
            const next = order[(order.indexOf(sortKey) + 1) % order.length];
            setSortKey(next);
          }}
        >
          <ArrowUpDown className="h-4 w-4" />
          Sort: <span className="font-medium capitalize">{sortKey}</span>
        </button>
      </div>

      {/* Table Head */}
      <div className="grid grid-cols-12 text-xs uppercase tracking-wider text-gray-300/80 px-3">
        <div className="col-span-4">User</div>
        <div className="col-span-3">Email</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/10 rounded-xl border border-white/10 overflow-hidden bg-white/5">
        <AnimatePresence initial={false}>
          {loadingUsers ? (
            [...Array(5)].map((_, i) => (
              <motion.div
                key={`s-${i}`}
                className="p-4 grid grid-cols-12 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="col-span-4 h-5 bg-white/10 rounded" />
                <div className="col-span-3 h-5 bg-white/10 rounded" />
                <div className="col-span-2 h-5 bg-white/10 rounded" />
                <div className="col-span-1 h-5 bg-white/10 rounded" />
                <div className="
