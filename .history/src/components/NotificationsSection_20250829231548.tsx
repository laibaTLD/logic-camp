import React from 'react';
import { NotificationAttributes } from '@/models/Notification';
import Notification from '@/components/Notification';

type NotificationsSectionProps = {
  notifications: NotificationAttributes[];
};

export default function NotificationsSection({ notifications }: NotificationsSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Notifications</h2>
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Notification key={notif.id} notification={notif} />
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No notifications.</p>
        )}
      </div>
    </section>
  );
}