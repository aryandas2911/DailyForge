import React, { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div className={`fixed top-24 right-6 flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-in z-[100] ${bgColors[type]}`}>
      {icons[type]}
      <p className="text-sm font-medium text-main">{message}</p>
      <button onClick={onClose} className="ml-2 text-muted hover:text-main cursor-pointer">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
