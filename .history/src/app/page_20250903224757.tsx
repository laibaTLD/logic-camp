'use client';
import React from 'react';
import { useUser } from '@/hooks/useUser';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { userData, loading, error } = useUser();
  console.log(userData);
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
  if (!userData) return <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">Unauthorized</div>;

  return <Dashboard userData={{
    ...userData,
    password: '',
    role: 'employee',
    isActive: true,
    isApproved: true
  }} />;
}