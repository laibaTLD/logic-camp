import { notFound } from 'next/navigation';
import { getProjectById } from '@/services/projectService';
import AdminProjectDetails from '../components/AdminProjectDetails';

export default async function AdminProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(Number(params.id));

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-8">
      <AdminProjectDetails project={project} />
    </div>
  );
}