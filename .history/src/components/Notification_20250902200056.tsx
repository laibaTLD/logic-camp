import React from 'react';
import { NotificationAttributes } from '@/models/Notification';

export default function Notification({ notification }: { notification: NotificationAttributes }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <p className="text-gray-800">{notification.message}</p>
      <span className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
    </div>
  );
}