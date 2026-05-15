import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = 24, className = "", color = "currentColor" }) => {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Loader2 
        size={size} 
        color={color} 
        className="animate-spin text-primary" 
      />
    </div>
  );
};

export default LoadingSpinner;
