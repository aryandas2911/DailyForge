import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[400px] w-full bg-transparent text-center p-6 box-border"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-12 h-12 text-[#3b8ea0] dark:text-[#4eb7b3] animate-spin mb-4" strokeWidth={2.5} />
      <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider animate-pulse">
        Loading data...
      </p>
    </div>
  );
};

export default LoadingSpinner;