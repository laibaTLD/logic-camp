import { notFound } from 'next/navigation';
import { getProjectById } from '@/services/projectService'; // Assuming this exists or needs to be created
import ProjectDetails from '@/components/ProjectDetails'; // We'll create this component

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(Number(params.id));

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-8">
      <ProjectDetails project={project} />
    </div>
  );
}