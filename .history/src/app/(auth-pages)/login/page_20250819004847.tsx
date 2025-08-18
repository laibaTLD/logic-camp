"use client";

import React, { useState } from "react";

interface LoginFormProps {
  onLoginSuccess?: (user: any, token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Parse response safely
      let data;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        // Show API error message
        setError(data?.message || "Something went wrong");
        setLoading(false);
        return;
      }

      // Success
      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.token);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm mx-auto border border-gray-200"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800">Login</h2>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 outline-none"
          required
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 outline-none"
          required
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-md text-white transition ${
          loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
