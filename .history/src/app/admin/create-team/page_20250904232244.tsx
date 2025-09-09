"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Users, User, Shield, Mail } from "lucide-react";
import toast from "react-hot-toast";
import useAdminData from "../hooks/useAdminData";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee" | "teamLead";
}

const CreateTeamPage: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Team form state
  const [teamData, setTeamData] = useState({
    name: "",
    description: "",
    members: [] as number[]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin authentication check
  useEffect(() => {
    const verifyAdminAuth = async () => {
      try {
        // Check for admin token in localStorage
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          router.push('/admin/adminLogin');
          return;
        }

        // Verify token with API
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });

        if (!verifyResponse.ok) {
          // Token is invalid, clear localStorage and redirect
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          router.push('/admin/adminLogin');
          return;
        }

        const verifyData = await verifyResponse.json();
        // Check if token is valid
        if (!verifyData.valid) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          router.push('/admin/adminLogin');
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth verification failed:', err);
        router.push('/admin/adminLogin');
      } finally {
        setAuthLoading(false);
      }
    };

    verifyAdminAuth();
  }, [router]);

  // Initialize admin data hook (must be called before any early returns)
  const { createTeam, users, loadingUsers } = useAdminData(isAuthenticated);
  
  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberToggle = (userId: number) => {
    setTeamData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamData.name.trim()) {
      setError("Team name is required");
      return;
    }

    if (teamData.members.length === 0) {
      setError("At least one team member is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createTeam({
        name: teamData.name,
        description: teamData.description,
        members: teamData.members
      });

      toast.success("Team created successfully!");
      router.push('/admin');
    } catch (err: any) {
      console.error('Error creating team:', err);
      setError(err.message || "Failed to create team");
      toast.error(err.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin
          </button>
          <div className="h-6 w-px bg-slate-600" />
          <h1 className="text-3xl font-bold text-white">Create New Team</h1>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Team Details Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Team Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={teamData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team name"
                    required
                  />
                </div>

                {/* Team Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={teamData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter team description (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Team Members Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <User className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Team Members</h2>
                <span className="text-sm text-slate-400">({teamData.members.length} selected)</span>
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-slate-400">Loading users...</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                        teamData.members.includes(user.id)
                          ? 'bg-blue-500/20 border-blue-500/50'
                          : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                      }`}
                      onClick={() => handleMemberToggle(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          teamData.members.includes(user.id)
                            ? 'bg-blue-500/30 text-blue-300'
                            : 'bg-slate-600/50 text-slate-400'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-slate-400 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                          user.role === 'teamLead' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          <Shield className="w-3 h-3 inline mr-1" />
                          {user.role}
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          teamData.members.includes(user.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-500'
                        }`}>
                          {teamData.members.includes(user.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <div className="text-red-300 text-sm">{error}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !teamData.name.trim() || teamData.members.length === 0}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Team
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}