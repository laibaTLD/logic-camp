'use client';

import React, { useState } from 'react';
import { useUser } from '@/lib/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} className="bg-gray-800 text-white" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} className="bg-gray-800 text-white" />
          </div>
          <div>
            <Label>Role</Label>
            <p>{user.role}</p>
          </div>
          <div>
            <Label>Joined</Label>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          {isEditing ? (
            <div className="flex space-x-2">
              <Button onClick={handleUpdate}>Save</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>
    </div>
  );
}