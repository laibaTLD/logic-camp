'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGoal } from '@/services/goalService';

export default function NewGoalPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const projectId = Number(params.id);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGoal({
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline || undefined,
        projectId,
      });
      router.push(`/admin/projects/${projectId}/goals`);
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Goal</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
              Goal Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter goal title"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter goal description"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-300">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
            >
              Create Goal
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}