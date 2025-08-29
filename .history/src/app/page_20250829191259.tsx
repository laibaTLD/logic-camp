import React from 'react';
import { getModels } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import ProjectCard from '../components/ProjectCard';
import TaskCard from '@/components/TaskCard';
import Notification from '@/components/Notification';
import Header from '@/components/Header';

export default async function Dashboard() {
  const cookieStore = cookies();
  const request = { cookies: cookieStore } as unknown as NextRequest;
  const payload = await verifyToken(request);
  if (!payload) {
    return <div>Unauthorized</div>;
  }

  const { User, Project, Task, Notification } = await getModels();
  const user = await User.findByPk(payload.userId, {
    include: [
      { model: Project, as: 'projects' },
      { model: Task, as: 'assignedTasks' },
      { model: Notification, as: 'notifications' }
    ]
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const userData = user.get({ plain: true });

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
            {userData.projects?.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            )) || <p>No projects assigned.</p>}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <div className="space-y-4">
            {userData.assignedTasks?.map((task: any) => (
              <TaskCard key={task.id} task={task} />
            )) || <p>No tasks assigned.</p>}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            {userData.notifications?.map((notif: any) => (
              <Notification key={notif.id} notification={notif} />
            )) || <p>No notifications.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}