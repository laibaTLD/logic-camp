"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Clear any existing tokens when admin login page loads
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store admin token in localStorage
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
      }

      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0b10] flex items-center justify-center px-4 overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60 animate-bounce-slow"></div>
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50 animate-bounce-slow animation-delay-2000"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)] z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 tracking-wide">
          <span className="text-indigo-400">Logic</span>
          <span className="text-purple-400">Camp</span> Admin
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 mb-1 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
          {loading && <p className="text-gray-300 text-sm text-center">Loading...</p>}

          <button
            type="submit"
            className="mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Login
          </button>
        </form>
      </div>

      <style>
        {`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 6s ease-in-out infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}
      </style>
    </div>
  );
}
