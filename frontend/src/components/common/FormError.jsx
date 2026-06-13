import { AlertCircle } from "lucide-react";

export default function FormError({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 animate-in"
    >
      <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
      <span className="text-sm font-medium leading-relaxed">{message}</span>
    </div>
  );
}
import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormError = ({ error }) => {
  if (!error) return null;

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="flex items-center gap-2 p-3 my-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <span className="font-medium">{error}</span>
    </div>
  );
};

export default FormError;
