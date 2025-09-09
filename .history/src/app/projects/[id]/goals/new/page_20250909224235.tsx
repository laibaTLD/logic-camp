'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGoal } from '@/services/goalService';
import Link from 'next/link';

export default function NewGoalPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const projectId = Number(params.id);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    deadline: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await createGoal({
        title: formData.title,
        description: formData.description,
        status: formData.status as 'todo' | 'inProgress' | 'testing' | 'completed',
        project_id: projectId,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      });
      
      router.push(`/projects/${projectId}/goals`);
    } catch (err) {
      setError('Failed to create goal. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-8">
      <div className="mb-6">
        <Link href={`/projects/${projectId}/goals`} className="text-blue-400 hover:underline">
          &larr; Back to Goals
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Create New Goal</h1>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-900/90 border border-white/20 rounded-xl p-6 max-w-2xl">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
          >
            <option value="todo">To Do</option>
            <option value="inProgress">In Progress</option>
            <option value="testing">Testing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">
            Deadline
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
}