import React from 'react';

import TaskCard from '@/components/TaskCard';
import { Task } from '@/models/Task'; // Assuming Task model

type TasksSectionProps = {
  tasks: Task[];
};

export default function TasksSection({ tasks }: TasksSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tasks</h2>
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No tasks assigned.</p>
        )}
      </div>
    </section>
  );
}