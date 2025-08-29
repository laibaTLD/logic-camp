import React from 'react';

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  // Add other fields as needed
};

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
      <p className="text-gray-600 mb-2">{task.description}</p>
      <span className="text-sm text-blue-500">Status: {task.status}</span>
    </div>
  );
}