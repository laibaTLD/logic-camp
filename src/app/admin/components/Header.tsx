"use client";

import { LogOut, Plus, Globe } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10 animate-slideDown"
    >
      <div className="px-6 md:px-10 py-4 flex items-center justify-between">
        {/* Left: Logo lockup */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_24px_rgba(99,102,241,0.55)]" />
          <div className="text-lg md:text-xl font-bold tracking-wide">
            <span className="text-indigo-400">Logic</span>
            <span className="text-purple-400">Camp</span>
          </div>
        </div>

        {/* Right: Branding + actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <span className="hidden sm:inline text-xs md:text-sm uppercase tracking-widest text-gray-300/90">
            Admin Dashboard | LogicCamp
          </span>

          <Link
            href="/admin/create-project"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm hover:bg-white/10 transition-all"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            New Project
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-2 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Globe className="h-4 w-4" />
            View Site
          </Link>

          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm hover:bg-white/5 transition-colors"
            onClick={() => {
              // TODO: hook into your auth/logout
              window.location.href = "/logout";
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
