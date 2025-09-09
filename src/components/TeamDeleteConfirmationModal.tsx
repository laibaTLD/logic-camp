"use client";

import { AlertTriangle, X, Trash2, Database } from "lucide-react";
import { useEffect, useState } from "react";

interface Project {
  id: number;
  name: string;
  description: string;
  status?: string;
  priority?: string;
}

interface TeamDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cascade?: boolean) => void;
  teamId: number;
  teamName: string;
  isLoading?: boolean;
}

export default function TeamDeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  teamId,
  teamName,
  isLoading = false,
}: TeamDeleteConfirmationModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showCascadeOption, setShowCascadeOption] = useState(false);

  // Fetch team details with associated projects
  useEffect(() => {
    if (isOpen && teamId) {
      const fetchTeamDetails = async () => {
        setLoadingProjects(true);
        try {
          const adminToken = localStorage.getItem('adminToken');
          const response = await fetch(`/api/teams/${teamId}/details`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setProjects(data.projects || []);
            setShowCascadeOption(data.projects?.length > 0);
          }
        } catch (error) {
          console.error('Error fetching team details:', error);
        } finally {
          setLoadingProjects(false);
        }
      };

      fetchTeamDetails();
    }
  }, [isOpen, teamId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const handleRegularDelete = () => {
    onConfirm(false);
  };

  const handleCascadeDelete = () => {
    onConfirm(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-red-500/20 backdrop-blur-xl shadow-[0_20px_60px_rgba(239,68,68,0.15)]">
          {/* Ambient gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-600/5 rounded-2xl" />
          
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-6 border-b border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Delete Team</h2>
            </div>
            
            {!isLoading && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className="relative z-10 p-6">
            <p className="text-white/80 mb-4">
              Are you sure you want to delete the team <span className="font-semibold text-white">"{teamName}"</span>?
            </p>
            
            {/* Team info */}
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-300">
                <span className="font-medium">Team to delete:</span> {teamName}
              </p>
            </div>

            {/* Loading projects */}
            {loadingProjects && (
              <div className="flex items-center gap-2 text-white/60 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white/60" />
                <span className="text-sm">Checking associated projects...</span>
              </div>
            )}

            {/* Associated projects warning */}
            {!loadingProjects && projects.length > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-amber-400" />
                  <span className="font-medium text-amber-300">
                    Associated Projects ({projects.length})
                  </span>
                </div>
                <p className="text-sm text-amber-200/80 mb-3">
                  This team has {projects.length} associated project{projects.length !== 1 ? 's' : ''}:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {projects.map((project) => (
                    <div key={project.id} className="text-xs text-amber-200/70 bg-amber-500/5 rounded px-2 py-1">
                      • {project.name}
                      {project.status && (
                        <span className="ml-2 text-amber-300/60">({project.status})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loadingProjects && projects.length === 0 && (
              <p className="text-sm text-white/60 mb-4">
                This team has no associated projects and can be safely deleted.
              </p>
            )}
            
            <p className="text-sm text-white/60">
              This action cannot be undone.
            </p>
          </div>
          
          {/* Actions */}
          <div className="relative z-10 flex items-center justify-end gap-3 p-6 border-t border-white/10">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            {/* Regular delete button - only show if no projects or if projects exist (will show error) */}
            {!loadingProjects && (
              <button
                onClick={handleRegularDelete}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {projects.length > 0 ? 'Try Delete' : 'Delete Team'}
                  </>
                )}
              </button>
            )}
            
            {/* Cascade delete button - only show if there are projects */}
            {!loadingProjects && showCascadeOption && (
              <button
                onClick={handleCascadeDelete}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Delete All
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}