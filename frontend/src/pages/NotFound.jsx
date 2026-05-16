import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] w-full text-center px-4 animate-in">
      <h1 className="text-6xl font-bold text-main mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-main mb-6">Page Not Found</h2>
      <p className="text-muted mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>
    </div>
  );
}
