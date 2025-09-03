import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserData {
  id: number;
  name: string;
  email: string;
  projects: any[];
  assignedTasks: any[];
  notifications: any[];
}

export function useUser() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        // Verify token with API
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!verifyResponse.ok) {
          // Token is invalid, clear localStorage and redirect
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        const response = await fetch('/api/user/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // On error, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  return { userData, loading, error };
}