import { useState } from "react";

const FEEDBACK_TYPES = ["Bug Report", "Feature Request", "General Feedback"];

const initialState = {
  email: "",
  type: "",
  message: "",
};

export default function FeedbackForm({ onClose }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.type) {
      newErrors.type = "Please select a feedback type.";
    }
    if (!form.message.trim()) {
      newErrors.message = "Message cannot be empty.";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    console.log("Feedback submitted:", form);
    setLoading(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialState);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl transition-all duration-300 transform scale-100">
          <div className="width-14 h-14 w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-2xl flex items-center justify-center mx-auto mb-4 font-bold">
            ✓
          </div>
          <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Thank you!
          </h2>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Your feedback has been received. We'll look into it shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              className="flex-1 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              onClick={handleReset}
            >
              Submit another
            </button>
            {onClose && (
              <button
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Feedback & Bug Report
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Help us improve DailyForge
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-lg p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 rounded-xl text-sm border bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border ${
                errors.email
                  ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-red-500"
                  : "border-slate-200 dark:border-slate-700 focus:border-transparent"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="type">
              Type of Feedback <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl text-sm border bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all cursor-pointer appearance-none box-border pr-10 ${
                  errors.type
                    ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-red-500"
                    : "border-slate-200 dark:border-slate-700 focus:border-transparent"
                }`}
              >
                <option value="" className="bg-white dark:bg-slate-900">Select a type...</option>
                {FEEDBACK_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-white dark:bg-slate-900">
                    {t}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12">
                  <path d="M6 8L1 3h10z" />
                </svg>
              </div>
            </div>
            {errors.type && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="message">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Describe your feedback or bug in detail..."
              rows={4}
              className={`w-full px-4 py-2.5 rounded-xl text-sm border bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all resize-vertical min-h-[100px] leading-relaxed box-border ${
                errors.message
                  ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-red-500"
                  : "border-slate-200 dark:border-slate-700 focus:border-transparent"
              }`}
            />
            {errors.message && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
            <button
              type="button"
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              onClick={handleReset}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}