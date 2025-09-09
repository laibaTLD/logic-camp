"use client";

import React from "react";
import TaskCard from "../../../components/TaskCard";

interface TaskAssignee {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: TaskAssignee; // Single assignee for backward compatibility
  assignees?: TaskAssignee[]; // Multiple assignees
}

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-6">
        No tasks found. Create one to get started.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
        />
      ))}
    </div>
  );
};

export default TaskList;
