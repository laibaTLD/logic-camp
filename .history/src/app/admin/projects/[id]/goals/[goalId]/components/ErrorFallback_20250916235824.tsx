'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ErrorFallbackProps {
  message?: string;
  description?: string;
}

export default function ErrorFallback({
  message = 'Error Loading Goal',
  description = 'Failed to fetch goal'
}: ErrorFallbackProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{message}</h2>
        <p className="text-gray-400 mb-6">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            ← Go Back
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}