'use client';

import React, { useEffect, useState } from 'react';
import AdminProjectDetails from './AdminProjectDetails';
import AdminProjectLayout from './AdminProjectLayout';
import { getProjectById } from '@/services/projectService';

export default function ProjectDetailsLoader({ projectId }: { projectId: number }) {
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const p = await getProjectById(projectId);
        if (isMounted) setProject(p);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load project');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [projectId]);

  if (loading) {
    return (
      <AdminProjectLayout>
        <div className="min-h-[50vh] text-white p-8 flex items-center justify-center">
          <div className="animate-pulse">Loading project…</div>
        </div>
      </AdminProjectLayout>
    );
  }

  if (error || !project) {
    return (
      <AdminProjectLayout>
        <div className="text-white p-8">
          <div className="max-w-3xl mx-auto bg-gray-900/90 border border-white/20 rounded-xl p-6">
            <h1 className="text-xl font-semibold text-red-300 mb-2">Unable to load project</h1>
            <p className="text-gray-400">{error || 'Project not found'}</p>
          </div>
        </div>
      </AdminProjectLayout>
    );
  }

  return (
    <AdminProjectLayout>
      <AdminProjectDetails project={project} />
    </AdminProjectLayout>
  );
}
