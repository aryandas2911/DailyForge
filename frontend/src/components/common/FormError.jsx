import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormError = ({ error, message }) => {
  const displayError = error || message;
  if (!displayError) return null;

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="flex items-center gap-2 p-3 my-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg animate-in"
    >
    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" aria-hidden="true" />
    <span className="font-medium leading-relaxed">{displayError}</span>
    </div>
  );
};

export default FormError;
