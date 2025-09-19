"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Target, 
  Calendar, 
  Edit, 
  Trash2, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Users
} from "lucide-react";
import toast from "react-hot-toast";
import StatusDropdown from "@/components/StatusDropdown";
import TaskCard from "./TaskCard";
import EditTaskModal from "./EditTaskModal";

interface AdminGoalDetailsProps {
  goal: any;
  initialTasks: any[];
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status_title?: string;
  status?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_CONFIG = {
  todo: { color: '#6B7280', label: 'To Do', icon: Clock },
  inProgress: { color: '#3B82F6', label: 'In Progress', icon: Clock },
  testing: { color: '#F59E0B', label: 'Testing', icon: AlertCircle },
  done: { color: '#10B981', label: 'Done', icon: CheckCircle },
  completed: { color: '#10B981', label: 'Completed', icon: CheckCircle }
};

export default function AdminGoalDetails({ goal, initialTasks }: AdminGoalDetailsProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(Array.isArray(initialTasks) ? initialTasks.filter(Boolean) as Task[] : []);
  const [loading, setLoading] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalData, setGoalData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    status_title: goal?.status_title || goal?.status || 'todo',
    deadline: goal?.deadline || ''
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status_title: 'todo',
    deadline: ''
  });

  const getStatusConfig = (status: string) => {
    const normalized = status?.toLowerCase() || 'todo';
    return STATUS_CONFIG[normalized as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.todo;
  };

  const handleUpdateGoal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });

      if (!response.ok) throw new Error('Failed to update goal');
      
      toast.success('Goal updated successfully');
      setEditingGoal(false);
      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update goal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete goal');
      
      toast.success('Goal deleted successfully');
      router.push('/admin');
    } catch (error) {
      toast.error('Failed to delete goal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          goalId: goal.id
        })
      });

      if (!response.ok) throw new Error('Failed to create task');
      
      const data = await response.json();
      const created: Task | null = (data && (data.task || data)) || null;
      setTasks(prev => [...prev.filter(Boolean), created].filter(Boolean) as Task[]);
      setNewTask({ title: '', description: '', status_title: 'todo', deadline: '' });
      setShowAddTask(false);
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update task status');
      
      setTasks(prev => (prev || []).filter(Boolean).map((t) => {
        const task = t as Task;
        return task.id === taskId ? { ...task, status_title: newStatus } as Task : task;
      }));
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks(prev => (prev || []).filter(Boolean).filter((t) => (t as Task).id !== taskId) as Task[]);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error(error);
    }
  };

  const currentStatusConfig = getStatusConfig(goalData.status_title);

  // Edit Task modal wiring via window event
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  useEffect(() => {
    const handler = (e: any) => {
      const t = e?.detail?.task || tasks.find((tk) => (tk as any).id === e?.detail?.taskId);
      if (t) {
        setEditingTask(t);
        setIsEditOpen(true);
      }
    };
    window.addEventListener('edit-task-request', handler as any);
    return () => window.removeEventListener('edit-task-request', handler as any);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Goal Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {editingGoal ? (
            <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="space-y-3">
                <label className="block text-sm text-gray-400">Title</label>
                <input
                  type="text"
                  value={goalData.title}
                  onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-base sm:text-lg font-semibold bg-gray-800/60 text-gray-100 border border-white/10 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Goal title"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm text-gray-400">Description</label>
                <textarea
                  value={goalData.description}
                  onChange={(e) => setGoalData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-800/60 text-gray-100 border border-white/10 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  rows={4}
                  placeholder="Goal description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <StatusDropdown
                    statuses={[]}
                    onStatusesChange={() => {}}
                    selectedStatus={goalData.status_title}
                    onStatusSelect={(status) => setGoalData(prev => ({ ...prev, status_title: status }))}
                    entityType="goal"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={goalData.deadline}
                    onChange={(e) => setGoalData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full bg-gray-800/60 text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleUpdateGoal}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl border font-semibold text-sm transition-all duration-300
                    flex items-center justify-center gap-2 hover:scale-[1.02] relative z-20
                    ${loading ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300' : 'bg-indigo-600/90 border-indigo-500/50 text-white hover:bg-indigo-600'}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving…</span>
                    </>
                  ) : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGoal(false)}
                  className="px-4 py-2 rounded-xl border font-semibold text-sm transition-all duration-300
                    flex items-center justify-center gap-2 hover:scale-[1.02] relative z-20
                    bg-slate-800/60 border-white/10 text-slate-200 hover:bg-slate-700/60"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{goal?.title}</h1>
              <p className="text-gray-400 mb-4">{goal?.description || 'No description provided.'}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: currentStatusConfig.color }} />
                  <span className="text-gray-300">{currentStatusConfig.label}</span>
                </div>
                {goal?.deadline && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {!editingGoal && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditingGoal(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border font-semibold text-xs sm:text-sm transition-all duration-300
                flex items-center justify-center gap-1.5 hover:scale-105 hover:-translate-y-0.5 relative z-20
                bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400/40"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Edit Goal</span>
            </button>
            <button
              onClick={handleDeleteGoal}
              disabled={loading}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border font-semibold text-xs sm:text-sm transition-all duration-300
                flex items-center justify-center gap-1.5 hover:scale-105 hover:-translate-y-0.5 relative z-20
                ${loading ? 'bg-red-500/20 border-red-400/40 text-red-300' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400/40'}
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0`}
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Delete Goal</span>
            </button>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Tasks ({tasks.length})</h2>
          <button
            onClick={() => setShowAddTask(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border font-semibold text-xs sm:text-sm transition-all duration-300
              flex items-center justify-center gap-1.5 hover:scale-105 hover:-translate-y-0.5 relative z-20
              bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/40"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-white mb-4">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-800/60 text-gray-100 border border-white/10 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-800/60 text-gray-100 border border-white/10 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  rows={3}
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <StatusDropdown
                    statuses={[]}
                    onStatusesChange={() => {}}
                    selectedStatus={newTask.status_title}
                    onStatusSelect={(status) => setNewTask(prev => ({ ...prev, status_title: status }))}
                    entityType="task"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full bg-gray-800/60 text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddTask}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl border font-semibold text-sm transition-all duration-300
                    flex items-center justify-center gap-2 hover:scale-[1.02] relative z-20
                    ${loading ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' : 'bg-emerald-600/90 border-emerald-500/50 text-white hover:bg-emerald-600'}
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating…</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Create Task</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 rounded-xl border font-semibold text-sm transition-all duration-300
                    flex items-center justify-center gap-2 hover:scale-[1.02] relative z-20
                    bg-slate-800/60 border-white/10 text-slate-200 hover:bg-slate-700/60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks yet. Add your first task to get started!</p>
            </div>
          ) : (
            tasks.map((task, idx) => (
              <TaskCard 
                key={task.id || idx}
                task={task}
                index={idx}
                onUpdateStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
              />
            ))
          )}
        </div>
      </div>
      <EditTaskModal
        isOpen={isEditOpen}
        task={editingTask}
        onClose={() => setIsEditOpen(false)}
        onSaved={(updated) => {
          setTasks((prev) => (prev || []).map((t) => ((t as any).id === (updated as any).id ? { ...(t as any), ...(updated as any) } : t)) as any);
        }}
      />
    </div>
  );
}
