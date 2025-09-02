interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  // Add other fields as needed
}

const API_URL = '/api/users';

export const updateUser = async (id: number, data: Partial<User>) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
};