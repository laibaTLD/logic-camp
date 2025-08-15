interface User {
  id: number;
  name: string;
  email: string;
}

const API_URL = "/api/auth"; // Change to backend URL if needed

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();
  return data as User & { token: string };
};

export const register = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) throw new Error("Registration failed");

  const data = await res.json();
  return data as User & { token: string };
};
