import React from 'react';

import { User } from '@/models/User'; // Assuming User model is exported from models

type UserProfileProps = {
  user: User;
};

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <section className="mb-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">User Profile</h1>
      <p className="text-gray-700 dark:text-gray-300">Name: {user.name}</p>
      <p className="text-gray-700 dark:text-gray-300">Email: {user.email}</p>
    </section>
  );
}