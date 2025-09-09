"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Calendar, Clock, User, Flag, Target } from "lucide-react";
import toast from "react-hot-toast";
import useAdminData from "../hooks/useAdminData";
// Removed useAuth import - using admin-specific authentication

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedToId?: number;
  dueDate?: string;
  estimatedHours?: number;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Project form state
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    teamId: "",
    priority: "medium" as 'low' | 'medium' | 'high' | 'urgent',
    status: "planning" as 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled',
    startDate: "",
    endDate: ""
  });

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState<Omit<Task, 'id'>>({
    title: "",
    description: "",
    priority: "medium",
    assignedToId: undefined,
    dueDate: "",
    estimatedHours: undefined
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



  // Admin authentication check
  useEffect(() => {
    const verifyAdminAuth = async () => {
      try {
        // Check for admin token in localStorage
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          router.push('/admin/adminLogin');
          return;
        }

        // Verify token with API
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });

        if (!verifyResponse.ok) {
          // Token is invalid, clear localStorage and redirect
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          router.push('/admin/adminLogin');
          return;
        }

        const verifyData = await verifyResponse.json();
        // Check if token is valid
        if (!verifyData.valid) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          router.push('/admin/adminLogin');
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth verification failed:', err);
        router.push('/admin/adminLogin');
      } finally {
        setAuthLoading(false);
      }
    };

    verifyAdminAuth();
  }, [router]);

  // Initialize admin data hook (must be called before any early returns)
  const { createProject, teams, loadingTeams, users } = useAdminData(isAuthenticated);

  // Debug: Log authentication and teams state
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, authLoading });
    console.log('Teams state:', { teams: teams?.length || 0, loadingTeams });
  }, [isAuthenticated, authLoading, teams, loadingTeams]);
  
  // Get team members for task assignment
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  // Team members effect - now safe to call after authentication checks
  useEffect(() => {
    if (projectData.teamId && teams.length > 0) {
      const selectedTeam = teams.find(team => team.id === parseInt(projectData.teamId));
      setTeamMembers(selectedTeam?.members || []);
    } else {
      setTeamMembers([]);
    }
  }, [projectData.teamId, teams]);

  const handleProjectChange = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleTaskChange = (field: string, value: any) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  };

  const addTask = () => {
    if (!taskForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      ...taskForm,
      estimatedHours: taskForm.estimatedHours ? Number(taskForm.estimatedHours) : undefined
    };

    setTasks(prev => [...prev, newTask]);
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      assignedToId: undefined,
      dueDate: "",
      estimatedHours: undefined
    });
    setShowTaskForm(false);
    toast.success("Task added successfully");
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success("Task removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!projectData.teamId) {
      setError("Please select a team for this project");
      setLoading(false);
      return;
    }

    try {
      // Create project first
      const project = await createProject({
        name: projectData.name,
        description: projectData.description,
        teamId: parseInt(projectData.teamId),
        priority: projectData.priority,
        status: projectData.status,
        startDate: projectData.startDate || undefined,
        endDate: projectData.endDate || undefined
      });

      // Create tasks if any
      if (tasks.length > 0) {
        for (const task of tasks) {
          await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              title: task.title,
              description: task.description,
              priority: task.priority,
              status: "todo",
              projectId: project.id,
              assignedToId: task.assignedToId || undefined,
              dueDate: task.dueDate || undefined,
              estimatedHours: task.estimatedHours || undefined
            })
          });
        }
      }

      toast.success(`Project "${projectData.name}" created successfully with ${tasks.length} tasks!`);
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Something went wrong";
      setError(errorMessage);
      toast.error(`Failed to create project: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'urgent': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'on-hold': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="px-6 md:px-10 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {error && (
            <div className="rounded-xl bg-red-600/20 border border-red-500/30 p-4 text-red-300">
              {error}
            </div>
          )}

          {/* Project Details Section */}
          <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="md:col-span-2">
                <label className="text-gray-200 text-sm font-medium block mb-2">Project Name *</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={projectData.name}
                  onChange={(e) => handleProjectChange('name', e.target.value)}
                  className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-gray-200 text-sm font-medium block mb-2">Description</label>
                <textarea
                  placeholder="Enter project description"
                  value={projectData.description}
                  onChange={(e) => handleProjectChange('description', e.target.value)}
                  rows={4}
                  className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              {/* Team Assignment */}
              <div>
                <label className="text-gray-200 text-sm font-medium block mb-2">Assign Team *</label>
                <select
                  value={projectData.teamId}
                  onChange={(e) => handleProjectChange('teamId', e.target.value)}
                  className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="" className="bg-gray-800 text-gray-300">
                    {loadingTeams ? "Loading teams..." : "-- Select Team --"}
                  </option>
                  {!loadingTeams && teams.map((team) => (
                    <option key={team.id} value={team.id} className="bg-gray-800 text-white">
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-gray-200 text-sm font-medium block mb-2">Priority</label>
                <select
                  value={projectData.priority}
                  onChange={(e) => handleProjectChange('priority', e.target.value)}
                  className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low" className="bg-gray-800">Low</option>
                  <option value="medium" className="bg-gray-800">Medium</option>
                  <option value="high" className="bg-gray-800">High</option>
                  <option value="urgent" className="bg-gray-800">Urgent</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-gray-200 text-sm font-medium block mb-2">Status</label>
                <select
                  value={projectData.status}
                  onChange={(e) => handleProjectChange('status', e.target.value)}
                  className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="planning" className="bg-gray-800">Planning</option>
                  <option value="active" className="bg-gray-800">Active</option>
                  <option value="on-hold" className="bg-gray-800">On Hold</option>
                  <option value="completed" className="bg-gray-800">Completed</option>
                  <option value="cancelled" className="bg-gray-800">Cancelled</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="text-gray-200 text-sm font-medium block mb-2">Start Date</label>
                <input
                  type="date"
                  value={projectData.startDate}
                  onChange={(e) => handleProjectChange('startDate', e.target.value)}
                  className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-gray-200 text-sm font-medium block mb-2">End Date</label>
                <input
                  type="date"
                  value={projectData.endDate}
                  onChange={(e) => handleProjectChange('endDate', e.target.value)}
                  className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </section>

          {/* Tasks Section */}
          <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Project Tasks ({tasks.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowTaskForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>

            {/* Task List */}
            {tasks.length > 0 && (
              <div className="space-y-3 mb-6">
                {tasks.map((task) => {
                  const assignedUser = teamMembers.find(member => member.id === task.assignedToId);
                  return (
                    <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">{task.title}</h3>
                          {task.description && (
                            <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs">
                            <span className={`px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            {assignedUser && (
                              <span className="text-gray-400 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {assignedUser.name}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {task.estimatedHours && (
                              <span className="text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.estimatedHours}h
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Task Form */}
            {showTaskForm && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Add New Task</h3>
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-gray-200 text-sm font-medium block mb-2">Task Title *</label>
                    <input
                      type="text"
                      placeholder="Enter task title"
                      value={taskForm.title}
                      onChange={(e) => handleTaskChange('title', e.target.value)}
                      className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-gray-200 text-sm font-medium block mb-2">Description</label>
                    <textarea
                      placeholder="Enter task description"
                      value={taskForm.description}
                      onChange={(e) => handleTaskChange('description', e.target.value)}
                      rows={2}
                      className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-200 text-sm font-medium block mb-2">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => handleTaskChange('priority', e.target.value)}
                      className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="low" className="bg-gray-800">Low</option>
                      <option value="medium" className="bg-gray-800">Medium</option>
                      <option value="high" className="bg-gray-800">High</option>
                      <option value="urgent" className="bg-gray-800">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-200 text-sm font-medium block mb-2">Assign To</label>
                    <select
                      value={taskForm.assignedToId || ""}
                      onChange={(e) => handleTaskChange('assignedToId', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="" className="bg-gray-800">-- Unassigned --</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id} className="bg-gray-800">
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-200 text-sm font-medium block mb-2">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => handleTaskChange('dueDate', e.target.value)}
                      className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="text-gray-200 text-sm font-medium block mb-2">Estimated Hours</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.5"
                      value={taskForm.estimatedHours || ""}
                      onChange={(e) => handleTaskChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={addTask}
                    className="px-4 py-2 rounded-xl bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 hover:text-green-200 transition-all duration-200"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="px-4 py-2 rounded-xl bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-300 hover:text-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {tasks.length === 0 && !showTaskForm && (
              <div className="text-center py-8 text-gray-400">
                <Flag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tasks added yet. Click "Add Task" to create tasks for this project.</p>
              </div>
            )}
          </section>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="px-6 py-3 rounded-xl bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-300 hover:text-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingTeams}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Project...
                </span>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}