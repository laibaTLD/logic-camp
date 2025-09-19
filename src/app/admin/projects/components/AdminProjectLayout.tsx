'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import Header from '../../components/Header';

interface AdminProjectLayoutProps {
  children: React.ReactNode;
}

export default function AdminProjectLayout({ children }: AdminProjectLayoutProps) {
  const router = useRouter();

  const handleSectionChange = (section: string) => {
    if (section === 'dashboard') router.push('/admin');
    else if (section === 'users') router.push('/admin?section=users');
    else if (section === 'teams') router.push('/admin?section=teams');
    else if (section === 'projects') router.push('/admin?section=projects');
    else router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar
          activeSection="projects"
          onSectionChange={handleSectionChange}
          onCreateProject={() => router.push('/admin?section=create-project')}
          onCreateTeam={() => router.push('/admin?section=teams')}
        />

        <main className="flex-1 lg:ml-80 transition-all duration-300">
          <Header />
          <div className="px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}




