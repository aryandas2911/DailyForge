import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[400px] w-full bg-transparent"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-500 text-lg font-medium animate-pulse">
        Loading data...
      </p>
    </div>
  );
};

export default LoadingSpinner;
