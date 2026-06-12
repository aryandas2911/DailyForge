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
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Thank you!</h2>
          <p style={styles.successMsg}>
            Your feedback has been received. We'll look into it shortly.
          </p>
          <div style={styles.successActions}>
            <button style={styles.btnPrimary} onClick={handleReset}>
              Submit another
            </button>
            {onClose && (
              <button style={styles.btnSecondary} onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Feedback & Bug Report</h2>
            <p style={styles.subtitle}>Help us improve DailyForge</p>
          </div>
          {onClose && (
            <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">
              Your Email <span style={styles.required}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
            />
            {errors.email && <p style={styles.errorMsg}>{errors.email}</p>}
          </div>

          {/* Feedback Type */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="type">
              Type of Feedback <span style={styles.required}>*</span>
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...styles.select,
                ...(errors.type ? styles.inputError : {}),
              }}
            >
              <option value="">Select a type...</option>
              {FEEDBACK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.type && <p style={styles.errorMsg}>{errors.type}</p>}
          </div>

          {/* Message */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="message">
              Message <span style={styles.required}>*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Describe your feedback or bug in detail..."
              rows={5}
              style={{
                ...styles.input,
                ...styles.textarea,
                ...(errors.message ? styles.inputError : {}),
              }}
            />
            {errors.message && <p style={styles.errorMsg}>{errors.message}</p>}
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="submit"
              style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
            <button
              type="button"
              style={styles.btnSecondary}
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

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "6px",
    lineHeight: 1,
  },
  field: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    color: "#111827",
    backgroundColor: "#f9fafb",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5",
  },
  select: {
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    cursor: "pointer",
  },
  textarea: {
    resize: "vertical",
    minHeight: "100px",
    lineHeight: "1.6",
  },
  errorMsg: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#ef4444",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  btnPrimary: {
    flex: 1,
    padding: "11px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  btnSecondary: {
    padding: "11px 20px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  successIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#d1fae5",
    color: "#059669",
    fontSize: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  successTitle: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 8px",
  },
  successMsg: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 24px",
  },
  successActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
};
