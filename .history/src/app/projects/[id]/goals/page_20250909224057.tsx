import { notFound } from 'next/navigation';
import { getProjectById } from '@/services/projectService';
import { getGoalsByProjectId } from '@/services/goalService';
import Link from 'next/link';

export default async function ProjectGoalsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const projectId = Number(resolvedParams.id);
  
  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }
  
  const goals = await getGoalsByProjectId(projectId);
  
  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-8">
      <div className="mb-6">
        <Link href={`/projects/${projectId}`} className="text-blue-400 hover:underline">
          &larr; Back to Project
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">{project.name}: Goals</h1>
      
      <div className="mb-6">
        <Link 
          href={`/projects/${projectId}/goals/new`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add New Goal
        </Link>
      </div>
      
      {goals.length > 0 ? (
        <div className="grid gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-gray-900/90 border border-white/20 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{goal.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(goal.status)}`}>
                  {formatStatus(goal.status)}
                </span>
              </div>
              
              {goal.description && (
                <p className="text-gray-300 mb-4">{goal.description}</p>
              )}
              
              <div className="flex justify-between items-center">
                <Link 
                  href={`/projects/${projectId}/goals/${goal.id}`}
                  className="text-blue-400 hover:underline"
                >
                  View Tasks ({goal.tasks?.length || 0})
                </Link>
                
                <div className="text-sm text-gray-400">
                  {goal.deadline && (
                    <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/90 border border-white/20 rounded-xl p-6 text-center">
          <p className="text-gray-400 mb-4">No goals have been created for this project yet.</p>
          <p>
            <Link 
              href={`/projects/${projectId}/goals/new`}
              className="text-blue-400 hover:underline"
            >
              Create your first goal
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'todo': return 'text-gray-400 bg-gray-400/10';
    case 'inProgress': return 'text-blue-400 bg-blue-400/10';
    case 'testing': return 'text-yellow-400 bg-yellow-400/10';
    case 'completed': return 'text-green-400 bg-green-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
}

function formatStatus(status: string) {
  switch (status) {
    case 'todo': return 'To Do';
    case 'inProgress': return 'In Progress';
    case 'testing': return 'Testing';
    case 'completed': return 'Completed';
    default: return status;
  }
}