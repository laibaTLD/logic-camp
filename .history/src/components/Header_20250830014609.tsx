'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown'; // Assume we'll create this
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    router.push('/login');
  };

  return (
    <header className="bg-[#0b0b10] shadow-md py-4 px-6 flex justify-between items-center text-white">
      <h1 className="text-2xl font-bold">MyTeamCamp Dashboard</h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Bell className="h-5 w-5" />
        </button>
        {isNotificationOpen && <NotificationDropdown />}
        <Link 
          href="/profile"
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <User className="h-5 w-5" />
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}