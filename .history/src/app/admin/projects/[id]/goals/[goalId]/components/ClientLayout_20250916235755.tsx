'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import Header from '@/app/admin/components/Header';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if the URL contains placeholder segments and redirect if needed
  useEffect(() => {
    // Check if the URL contains literal [id] or [goalId] placeholders
    if (pathname.includes('/[id]/') || pathname.includes('/[goalId]')) {
      // Redirect to the admin dashboard as a fallback
      router.replace('/admin');
    }
  }, [pathname, router]);
  
  const handleSectionChange = (section: string) => {
    if (section === 'dashboard') router.push('/admin');
    else if (section === 'users') router.push('/admin?section=users');
    else if (section === 'teams') router.push('/admin?section=teams');
    else if (section === 'projects') router.push('/admin?section=projects');
  };

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
}