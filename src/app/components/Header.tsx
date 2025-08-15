// src/components/Header.tsx
"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "myTeamCamp" }) => {
  return (
    <header className="w-full bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-wide">{title}</h1>

      {/* Navigation Links */}
      <nav className="flex gap-6">
        <Link href="/" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
        <Link href="/tasks" className="hover:underline">
          Tasks
        </Link>
        <Link href="/messages" className="hover:underline">
          Messages
        </Link>
      </nav>

      {/* Auth Buttons */}
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-transparent border border-white px-4 py-2 rounded hover:bg-white hover:text-gray-900 transition"
        >
          Register
        </Link>
        <Link
          href="/signin"
          className="bg-white text-gray-900 px-4 py-2 rounded hover:bg-gray-200 transition"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
};

export default Header;
