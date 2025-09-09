import React from 'react';

type LoadingScreenProps = {
  message?: string;
};

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">
      {message}
    </div>
  );
}
