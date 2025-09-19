'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StatusDropdown from '@/components/StatusDropdown';

interface EditTaskModalProps {
  isOpen: boolean;
  task: any | null;
  onClose: () => void;
  onSaved: (updated: any) => void;
}

export default function EditTaskModal({ isOpen, task, onClose, onSaved }: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('todo');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0,10) : '');
      setStatus(task.status_title || task.status || 'todo');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dueDate: deadline || undefined,
          status: status,
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update task');
      }
      const updated = await res.json();
      onSaved(updated.task || updated);
      onClose();
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <div className="relative w-full max-w-xl mx-4 rounded-2xl bg-gradient-to-b from-[#0f1220] to-[#0b0d18] text-white border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fadeInUp">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="text-base sm:text-lg font-semibold">Edit Task</div>
          <button onClick={() => !saving && onClose()} className="text-slate-300 hover:text-white px-2 py-1 rounded-md hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-gray-800/60 border border-white/10 px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Task title"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-gray-800/60 border border-white/10 px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              placeholder="Task description"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Status</label>
              <StatusDropdown
                statuses={[]}
                onStatusesChange={() => {}}
                selectedStatus={status}
                onStatusSelect={(s) => setStatus(s)}
                entityType="task"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl bg-gray-800/60 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-2 border-t border-white/10">
          <button
            disabled={saving}
            onClick={() => onClose()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white hover:bg-slate-700/60 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}


