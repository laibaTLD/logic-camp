"use client";

import React, { useState } from "react";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined }); // clear field-specific error
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrors({});

    // Basic client-side validation
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Safe JSON parsing
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Server returned invalid JSON");
      }

      if (!res.ok) {
        setMessage({ text: data.message || `Error ${res.status}`, type: "error" });
      } else {
        setMessage({ text: data.message || "Registration successful!", type: "success" });
        setForm({ name: "", email: "", password: "" });
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setMessage({ text: err.message || "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-gray-400 mb-6">Fill in your details to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block mb-1 text-gray-300">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 ${
                errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-blue-500"
              }`}
              required
            />
            {errors.name && <p className="mt-1 text-red-400 text-sm">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-blue-500"
              }`}
              required
            />
            {errors.email && <p className="mt-1 text-red-400 text-sm">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-1 text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-blue-500"
              }`}
              required
            />
            {errors.password && <p className="mt-1 text-red-400 text-sm">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Registering..." : "Save & Continue"}
          </button>
        </form>

        {/* Global Message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
          >
            {message.type === "success" ? "✅ " : "❌ "}
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
