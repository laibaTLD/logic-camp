"use client";

import React, { useState } from "react";

interface LoginFormProps {
  onSuccess?: (user: any, token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is empty
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        setError(data.message || "Something went wrong");
      } else {
        if (onSuccess) onSuccess(data.user, data.token);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm mx-auto border border-gray-200"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800">Login</h2>

      {error && (
        <div className="mb-4 text-red-600 text-sm border border-red-200 p-2 rounded">
          {error}
        </div>
      )}

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
          disabled={loading}
        />
      </div>

      {/* Password */}
