"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}: DeleteConfirmationModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-red-500/20 backdrop-blur-xl shadow-[0_20px_60px_rgba(239,68,68,0.15)] max-h-[90vh] overflow-auto">
          {/* Ambient gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-600/5 rounded-2xl" />
          
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-5 sm:p-6 border-b border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
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
          <div className="relative z-10 p-5 sm:p-6">
            <p className="text-white/80 mb-3">{message}</p>
            {itemName && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300">
                  <span className="font-medium">Item to delete:</span> {itemName}
                </p>
              </div>
            )}
            <p className="text-sm text-white/60 mt-4">
              This action cannot be undone.
            </p>
          </div>
          
          {/* Actions */}
          <div className="relative z-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-5 sm:p-6 border-t border-white/10">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}