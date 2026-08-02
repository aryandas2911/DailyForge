import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormError = ({ error, message }) => {
  const displayError = error || message;
  if (!displayError) return null;

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 text-xs font-bold leading-normal w-full box-border animate-in"
    >
    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" aria-hidden="true" strokeWidth={2.5} />
    <span className="break-words leading-relaxed">{displayError}</span>
    </div>
  );
};

export default FormError;