import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminGoalDetails from '@/app/admin/goals/components/AdminGoalDetails';
import GoalDetailsLoader from '@/app/admin/goals/components/GoalDetailsLoader';
import ClientLayout from './components/ClientLayout';

export default async function AdminProjectGoalPage({ params }: { params: Promise<{ id: string; goalId: string }> }) {
  const resolvedParams = await params;

  // Build absolute base URL for server-side fetch
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`)
  ).replace(/\/$/, '');

  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value;

  const goalId = resolvedParams.goalId;
  const projectId = resolvedParams.id;

  try {
    const [goalRes, tasksRes] = await Promise.all([
      fetch(`${baseUrl}/api/goals/${goalId}`, {
        headers: authToken ? { Cookie: `authToken=${authToken}` } : undefined,
        cache: 'no-store'
      }),
      fetch(`${baseUrl}/api/tasks?goalId=${goalId}`, {
        headers: authToken ? { Cookie: `authToken=${authToken}` } : undefined,
        cache: 'no-store'
      })
    ]);

    if (!goalRes.ok) {
      if (goalRes.status === 404) notFound();
      // Fallback to client loader if unauthorized or other server-side fetch failures
      return <GoalDetailsLoader goalId={Number(goalId)} />;
    }

    const [goalData, tasksData] = await Promise.all([
      goalRes.json(), 
      tasksRes.ok ? tasksRes.json() : Promise.resolve({ tasks: [] })
    ]);
    const goal = goalData.goal || goalData;
    const initialTasks = Array.isArray(tasksData) ? tasksData : (tasksData?.tasks || []);

    if (!goal) {
      notFound();
    }

    const statusTitle = goal?.status_title || goal?.status || 'todo';
    const projectName = goal?.project?.name || 'No Project';
    const tasksCount = Array.isArray(initialTasks) ? initialTasks.length : 0;

    return (
      <ClientLayout>
        {/* Page header */}
        <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-6">
            {/* Breadcrumbs */}
            <nav className="text-sm text-gray-400 mb-3" aria-label="Breadcrumb">
              <ol className="inline-flex items-center gap-2">
                <li className="hover:text-gray-200 transition-colors"><a href="/admin">Admin</a></li>
                <li className="opacity-50">/</li>
                <li className="hover:text-gray-200 transition-colors"><a href={`/admin/projects/${projectId}`}>Project</a></li>
                <li className="opacity-50">/</li>
                <li className="text-gray-200 truncate max-w-[40ch]" title={goal?.title}>{goal?.title}</li>
              </ol>
            </nav>

            {/* Title row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{goal?.title}</h1>
                <p className="text-gray-400 mt-1 truncate max-w-3xl">{goal?.description || 'No description provided.'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-sm capitalize">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/80" />
                  {statusTitle}
                </span>
                <a
                  href={`/admin/projects/${projectId}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm transition-colors"
                >
                  ← Back to Project
                </a>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wider text-gray-400">Project</div>
                <div className="text-white mt-1 font-medium">{projectName}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wider text-gray-400">Deadline</div>
                <div className="text-white mt-1 font-medium">{goal?.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Not set'}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wider text-gray-400">Tasks</div>
                <div className="text-white mt-1 font-medium">{tasksCount}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wider text-gray-400">Created</div>
                <div className="text-white mt-1 font-medium">{goal?.createdAt ? new Date(goal.createdAt).toLocaleDateString() : '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-6 sm:py-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900/60 via-slate-800/30 to-slate-900/40 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <AdminGoalDetails goal={goal} initialTasks={initialTasks} />
          </div>
        </div>
      </ClientLayout>
    );
  } catch (_e) {
    // Network/URL issues -> client fallback
    return <GoalDetailsLoader goalId={Number(goalId)} />;
  }
}


