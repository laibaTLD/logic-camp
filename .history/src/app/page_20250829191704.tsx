'use client';
import React from 'react';
import { useUser } from '@/hooks/useUser';
import ProjectCard from '@/components/ProjectCard';
import TaskCard from '@/components/TaskCard';
import Notification from '@/components/Notification';
import Header from '@/components/Header';

export default function Dashboard() {
  const { userData, loading, error } = useUser();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userData) return <div>Unauthorized</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6">
        <section className="mb-8">
          <h1 className="text-2xl font-bold mb-4">User Profile</h1>
          <p>Name: {userData.name}</p>
          <p>Email: {userData.email}</p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userData.projects?.length > 0 ? (
              userData.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <p>No projects assigned.</p>
            )}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <div className="space-y-4">
            {userData.assignedTasks?.length > 0 ? (
              userData.assignedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <p>No tasks assigned.</p>
            )}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            {userData.notifications?.length > 0 ? (
              userData.notifications.map((notif) => (
                <Notification key={notif.id} notification={notif} />
              ))
            ) : (
              <p>No notifications.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}