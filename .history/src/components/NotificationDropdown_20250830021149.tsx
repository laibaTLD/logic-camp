'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useUser } from '@/lib/context/UserContext';
import { getNotifications } from '@/services/notificationService'; // Assume this exists or create later

// Using standard HTML elements instead of missing UI components

export default function NotificationDropdown() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        try {
          const data = await getNotifications(user.id);
          setNotifications(data);
        } catch (error) {
          console.error('Failed to fetch notifications', error);
        }
      };
      fetchNotifications();
    }
  }, [isOpen, user.id]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-300 hover:text-white" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 text-white border border-white/20 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Notifications</h3>
            {notifications.length > 0 ? (
              <ul className="space-y-2">
                {notifications.map((notif) => (
                  <li key={notif.id} className="text-sm">
                    {notif.message} - {new Date(notif.createdAt).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No new notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}