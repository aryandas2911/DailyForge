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
