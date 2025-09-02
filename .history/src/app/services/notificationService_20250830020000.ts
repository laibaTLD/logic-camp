interface Notification {
  id: number;
  message: string;
  read: boolean;
}

const API_URL = "/api/notifications";

export const getNotifications = async (userId: number): Promise<Notification[]> => {
  const res = await fetch(`${API_URL}?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

export const markAsRead = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}/read`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
};
