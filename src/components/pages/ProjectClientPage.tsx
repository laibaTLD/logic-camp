"use client";
import React, { useEffect, useState } from 'react';
import { getProjectById } from '@/services/projectService';
import ProjectDetails from '@/components/ProjectDetails';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ErrorScreen from '@/components/ui/ErrorScreen';

export default function ProjectClientPage({ id }: { id: number }) {
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProjectById(Number(id));
        setProject(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error || !project) return <ErrorScreen message={error || 'Project not found'} />;

  return <ProjectDetails project={project} />;
}
