'use client';
import React from 'react';
import Header from '@/components/Header';
import UserProfile from '@/components/UserProfile';
import ProjectsSection from '@/components/ProjectsSection';
import TasksSection from '@/components/TasksSection';
import NotificationsSection from '@/components/NotificationsSection';

import { User } from '@/models/User'; // Assuming User type includes projects, assignedTasks, notifications

type DashboardProps = {
  userData: User;
};

export default function Dashboard({ userData }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto p-6">
        <UserProfile user={userData} />
        <ProjectsSection projects={userData.projects || []} />
        <TasksSection tasks={userData.assignedTasks || []} />
        <NotificationsSection notifications={userData.notifications || []} />
      </main>
    </div>
  );
}