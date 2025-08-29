import React from 'react';

type NotificationType = {
  id: number;
  message: string;
  createdAt: string;
  // Add other fields as needed
};

export default function Notification({ notification }: { notification: NotificationType }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <p className="text-gray-800">{notification.message}</p>
      <span className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
    </div>
  );
}