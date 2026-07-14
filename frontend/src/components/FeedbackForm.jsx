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
    // Simulated submission — connect to backend/email API later
    await new Promise((res) => setTimeout(res, 1000));
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
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
<div className="card surface-bg w-full max-w-md rounded-2xl p-8 shadow-2xl">

    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-600 dark:bg-green-900 dark:text-green-300">
      ✓
    </div>

    <h2 className="mb-2 text-center text-2xl font-semibold text-main">
    Thank you!
    </h2>

    <p className="mb-6 text-center text-sm text-muted">
      Your feedback has been received. We'll look into it shortly.
    </p>

    <div className="flex justify-center gap-3">
      <button
            onClick={handleReset}
            className="btn btn-primary px-5 py-2.5"
            >
        Submit another
      </button>

      {onClose && (
        <button
        onClick={onClose}
        className="btn border-soft surface-bg text-main hover-lift"
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
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
<div className="card surface-bg w-full max-w-md rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-main">Feedback & Bug Report</h2>
            <p className="mt-1 text-sm text-muted">Help us improve DailyForge</p>
          </div>
          {onClose && (
           <button
            onClick={onClose}
           aria-label="Close"
            className="rounded-md p-2 text-muted hover:bg-[var(--accent)]"
                >
                   ✕
            </button>
         )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
             className="mb-2 block text-sm font-medium text-main"
              >
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full rounded-lg border px-4 py-2 surface-bg text-main focus:outline-none focus:ring-2 ${
              errors.email
              ? "border-red-500"
              : "border-soft"
}`}
            />
            {errors.email && (
           <p className="mt-1 text-sm text-red-500">
                 {errors.email}
           </p>
)}
          </div>

         {/* Feedback Type */}
        <div className="mb-5">
        <label
  htmlFor="type"
  className="mb-2 block text-sm font-medium text-main"
>
  Type of Feedback <span className="text-red-500">*</span>
</label>

  <select
    id="type"
    name="type"
    value={form.type}
    onChange={handleChange}
    className={`w-full rounded-lg border px-4 py-2 surface-bg text-main focus:outline-none focus:ring-2 ${
    errors.type ? "border-red-500" : "border-soft"
}`} 
  >
    <option value="">Select a type...</option>
    {FEEDBACK_TYPES.map((t) => (
      <option key={t} value={t}>
        {t}
      </option>
    ))}
  </select>

  {errors.type && (
    <p className="mt-1 text-sm text-red-500">{errors.type}</p>
  )}
</div>

{/* Message */}
<div className="mb-5">
 <label
  htmlFor="message"
  className="mb-2 block text-sm font-medium text-main"
>
  Message <span className="text-red-500">*</span>
</label>

  <textarea
    id="message"
    name="message"
    value={form.message}
    onChange={handleChange}
    placeholder="Describe your feedback or bug in detail..."
    rows={5}
    className={`w-full rounded-lg border px-4 py-2 surface-bg text-main focus:outline-none focus:ring-2 ${
    errors.message ? "border-red-500" : "border-soft"
}`}
  />

  {errors.message && (
    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
  )}
</div>

{/* Actions */}

<div className="mt-6 flex gap-3">
  <button
    type="submit"
    disabled={loading}
    className="btn btn-primary flex-1 disabled:opacity-70"
  >
    {loading ? "Submitting..." : "Submit Feedback"}
  </button>

  <button
    type="button"
    onClick={handleReset}
    disabled={loading}
   className="btn border-soft surface-bg text-main hover-lift"
  >
    Clear
  </button>
</div>
        </form>
      </div>
    </div>
  );
}
