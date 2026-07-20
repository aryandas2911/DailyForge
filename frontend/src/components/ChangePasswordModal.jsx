import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import FormError from "./common/FormError";

const ChangePasswordModal = ({ onClose, onSubmit, errorMessage, onError }) => {
  const [email, setEmail] = useState("");
  // Mode to control the flow: 'requestEmail' (initial) or 'emailSent' (after successful request)
  const [mode, setMode] = useState('requestEmail');
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflowY = "scroll";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflowY = "";
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Clear success message if an external error is passed
  useEffect(() => {
    if (errorMessage) {
      setSuccessMessage("");
    }
  }, [errorMessage]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    onError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages

    if (!email.trim()) {
      return onError("Email is required.");
    }
    // Basic email format validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return onError("Please enter a valid email address.");
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ email }); // Call onSubmit from Login.jsx to handle API call
      setSuccessMessage("If an account with that email exists, a password reset link has been sent to your inbox.");
      setMode('emailSent');
    } catch (err) {
      onError(err.message || "Failed to send password reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center z-999
                  py-10 px-4
                  bg-black/20 dark:bg-black/50 backdrop-blur-sm
                  animate-in"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="bg-(--surface) rounded-2xl shadow-xl w-full max-w-md p-6
                    relative border border-soft animate-in delay-100 overflow-y-auto max-h-screen"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-1 rounded-full text-main
                      hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold text-main mb-4 text-center">
            Forgot Password
          </h2>

          <FormError error={errorMessage} />
          {successMessage && (
            <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
              {successMessage}
            </div>
          )}

          {mode === 'requestEmail' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-main">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full mt-1 p-2 border border-soft rounded-lg
                          focus:ring-(--primary) focus:border-(--primary)
                          bg-transparent text-main dark:bg-slate-800"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
              disabled={isSubmitting}
              className="w-full btn btn-primary py-2 mt-2 hover-lift disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {mode === 'emailSent' && (
            <div className="text-center">
              <p className="text-sm text-muted mb-4">
                You can close this window.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full btn btn-primary py-2 mt-2 hover-lift"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body
    )
  );
};

export default ChangePasswordModal;
