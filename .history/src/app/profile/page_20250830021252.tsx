'use client';

import React, { useState } from 'react';
import { useUser } from '@/lib/context/UserContext';
// Using standard HTML elements instead of missing UI components

import { updateUser } from '@/services/userService'; // Assume this exists or create later

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async () => {
    try {
      const updatedUser = await updateUser(user.id, { name, email });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-8">
      <div className="max-w-2xl mx-auto bg-gray-900/90 border border-white/20 rounded-xl p-6 space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={!isEditing} 
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 disabled:opacity-50" 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={!isEditing} 
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 disabled:opacity-50" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
            <p>{user.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Joined</label>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          {isEditing ? (
            <div className="flex space-x-2">
              <button 
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Save
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}