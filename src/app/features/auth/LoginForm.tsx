"use client";

import React, { useState } from "react";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email, password);
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

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
