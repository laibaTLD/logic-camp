import { notFound } from 'next/navigation';
import { getProjectById } from '@/services/projectService';
import { getGoalById } from '@/services/goalService';
import { getTasksByGoal } from '@/services/taskService';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';

export default async function GoalTasksPage({ params }: { params: Promise<{ id: string, goalId: string }> }) {
  const resolvedParams = await params;
  const projectId = Number(resolvedParams.id);
  const goalId = Number(resolvedParams.goalId);
  
  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }
  
  const goal = await getGoalById(goalId);
  if (!goal || goal.project_id !== projectId) {
    notFound();
  }
  
  const tasks = await getTasksByGoal(goalId);
  
  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-8">
      <div className="mb-6">
        <Link href={`/projects/${projectId}/goals`} className="text-blue-400 hover:underline">
          &larr; Back to Goals
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{goal.title}</h1>
      <div className="mb-6">
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(goal.status)}`}>
          {formatStatus(goal.status)}
        </span>
      </div>
      
      {goal.description && (
        <p className="text-gray-300 mb-6">{goal.description}</p>
      )}
      
      <div className="mb-6">
        <Link 
          href={`/projects/${projectId}/goals/${goalId}/tasks/new`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add New Task
        </Link>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
      
      {tasks.length > 0 ? (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={{
                ...task,
                status: task.completed ? 'completed' : 'todo' // Map completed boolean to status string
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/90 border border-white/20 rounded-xl p-6 text-center">
          <p className="text-gray-400 mb-4">No tasks have been created for this goal yet.</p>
          <p>
            <Link 
              href={`/projects/${projectId}/goals/${goalId}/tasks/new`}
              className="text-blue-400 hover:underline"
            >
              Create your first task
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