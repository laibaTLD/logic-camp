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

  return (
    <div className="space-y-6">
      {/* Goal Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {editingGoal ? (
            <div className="space-y-4">
              <input
                type="text"
                value={goalData.title}
                onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-2xl font-bold bg-transparent border-b border-white/20 text-white focus:outline-none focus:border-white/40"
                placeholder="Goal title"
              />
              <textarea
                value={goalData.description}
                onChange={(e) => setGoalData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-transparent border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-white/40 resize-none"
                rows={3}
                placeholder="Goal description"
              />
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
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateGoal}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditingGoal(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Goal
            </button>
            <button
              onClick={handleDeleteGoal}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Goal
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
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                  rows={2}
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddTask}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
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
                key={task.id}
                task={task}
                index={idx}
                onUpdateStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
