import React from 'react';

type ErrorScreenProps = {
  message?: string;
};

export default function ErrorScreen({ message = 'Something went wrong' }: ErrorScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen text-red-500">
      {message}
    </div>
  );
}
