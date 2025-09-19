import { notFound } from 'next/navigation';
import { getProjectById } from '@/services/projectService'; // Assuming this exists or needs to be created
import ProjectDetails from '@/components/ProjectDetails'; // We'll create this component

import ProjectClientPage from '@/components/pages/ProjectClientPage';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  if (Number.isNaN(id)) {
    notFound();
  }
  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-8">
      <ProjectClientPage id={id} />
    </div>
  );
}