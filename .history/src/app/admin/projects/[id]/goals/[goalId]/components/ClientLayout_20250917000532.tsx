'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import Header from '@/app/admin/components/Header';
import ErrorFallback from './ErrorFallback';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasInvalidUrl, setHasInvalidUrl] = useState(false);
  
  // Check if the URL contains placeholder segments
  useEffect(() => {
    // Check if the URL contains literal [id] or [goalId] placeholders
    if (pathname.includes('/[id]/') || pathname.includes('/[goalId]')) {
      setHasInvalidUrl(true);
    }
  }, [pathname]);
  
  const handleSectionChange = (section: string) => {
    if (section === 'dashboard') router.push('/admin');
    else if (section === 'users') router.push('/admin?section=users');
    else if (section === 'teams') router.push('/admin?section=teams');
    else if (section === 'projects') router.push('/admin?section=projects');
  };

  // If the URL contains placeholder segments, show the error fallback
  if (hasInvalidUrl) {
    return (
      <ErrorFallback 
        message="Invalid Goal URL" 
        description="The URL contains placeholder values instead of actual IDs. Please navigate to a valid goal or return to the dashboard."
      />
    );
  }

  // Otherwise, render the normal layout
  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden flex">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />
      
      {/* Admin Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar 
          activeSection="projects" 
          onSectionChange={handleSectionChange}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}