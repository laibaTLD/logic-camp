'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useUser } from '@/lib/context/UserContext';
import { getNotifications } from '@/services/notificationService'; // Assume this exists or create later

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="p-2">
          <Bell className="h-5 w-5 text-gray-300 hover:text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-900 text-white border border-white/20">
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
      </PopoverContent>
    </Popover>
  );
}