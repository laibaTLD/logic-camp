"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onLoginSuccess?: (user: any, token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    // Client-side validation
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Read text first
      const text = await res.text();
      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Response text:", text);
        throw new Error("Server returned invalid response (not JSON)");
      }

      if (!res.ok) {
        let serverMessage = data.error || data.message || res.statusText;
        if (res.status === 403 && serverMessage.includes("pending approval")) {
          serverMessage = "Your account is not yet approved by the admin.";
        }
        setError(serverMessage);
        setLoading(false);
        return;
      }

      // Success 🎉
      console.log("Login successful:", data);

      if (data.token) {
        // ✅ Save JWT + user info for later use
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.token || "");
      }

      // Reset form (optional)
      setEmail("");
      setPassword("");

      // Redirect to dashboard
      router.push("/");

    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setError(err.message || "Something went wrong during login");
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
        {emailError && <p className="mt-1 text-red-600 text-sm">{emailError}</p>}
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
        {passwordError && (
          <p className="mt-1 text-red-600 text-sm">{passwordError}</p>
        )}
      </div>

      {/* General Error */}
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;