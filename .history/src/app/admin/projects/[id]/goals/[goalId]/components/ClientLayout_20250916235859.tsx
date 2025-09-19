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
    <div className="min-h-screen bg-[#0b0b10] text-white flex">
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