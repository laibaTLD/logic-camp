// src/components/Sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLink {
  label: string;
  href: string;
}

const links: SidebarLink[] = [
  { label: "Dashboard", href: "/" },
  { label: "Users", href: "/users" },
  { label: "Projects", href: "/projects" },
  { label: "Tasks", href: "/tasks" },
  { label: "Messages", href: "/messages" },
  { label: "Files", href: "/files" },
  { label: "Notifications", href: "/notifications" },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-gray-900 text-gray-200 flex flex-col p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-6">myTeamCamp</h2>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-md ${
            pathname === link.href
                ? "bg-gray-900 text-white"
                : "hover:bg-gray-800"

            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
