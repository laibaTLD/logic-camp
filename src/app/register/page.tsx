"use client";

import React, { useState } from "react";

const AccountInfoPage: React.FC = () => {
  const [form, setForm] = useState({
    username: "",
    age: "",
    bio: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Account info submitted:", form);
    // TODO: Send data to backend API
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-8">
      {/* Card */}
      <div className="bg-gray-900 text-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-2">Let’s set up your account</h1>
        <p className="text-gray-400 mb-6">
          Just a few more details and you’re good to go.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block mb-1 text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring focus:border-blue-500"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="block mb-1 text-gray-300">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="Your age"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring focus:border-blue-500"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block mb-1 text-gray-300">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountInfoPage;
