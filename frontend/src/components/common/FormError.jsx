import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  error: string;
}

const FormError:  = ({ error }) => {
  if (!error) return null;

  return (
    <div 
      role="alert" 
      className="flex items-center gap-2 p-3 my-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium">{error}</span>
    </div>
  );
};

export default FormError;
