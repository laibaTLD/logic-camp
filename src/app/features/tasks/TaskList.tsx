"use client";

import React from "react";
import TaskCard from "../../components/TaskCard";

interface Task {
  id: string;
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
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
          title={task.title}
          status={task.status}
          dueDate={task.dueDate}
        />
      ))}
    </div>
  );
};

export default TaskList;
