"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function GoalsCreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<'todo'|'inProgress'|'testing'|'completed'>('todo');
  const [deadline, setDeadline] = useState("");
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.projects || []);
    };
    fetchProjects();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) {
      toast.error('Title and Project are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, status, projectId, deadline: deadline || undefined })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create goal');
      }
      toast.success('Goal created');
      setTitle(""); setDescription(""); setStatus('todo'); setDeadline(""); setProjectId(undefined);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Create Goal</h1>
      <form onSubmit={submit} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-xl bg-slate-700/50 border border-slate-600/50 text-white px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full rounded-xl bg-slate-700/50 border border-slate-600/50 text-white px-4 py-2" rows={3} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value as any)} className="w-full rounded-xl bg-slate-700/50 border border-slate-600/50 text-white px-4 py-2">
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="testing">Testing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Deadline</label>
            <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full rounded-xl bg-slate-700/50 border border-slate-600/50 text-white px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Project</label>
            <select value={projectId ?? ''} onChange={e=>setProjectId(e.target.value?Number(e.target.value):undefined)} className="w-full rounded-xl bg-slate-700/50 border border-slate-600/50 text-white px-4 py-2">
              <option value="">-- Select Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button disabled={loading} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm text-white disabled:opacity-50">{loading? 'Creating...' : 'Create Goal'}</button>
        </div>
      </form>
    </div>
  );
}


