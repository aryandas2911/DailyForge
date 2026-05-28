import { useRef, useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import api from "../api/axios";

const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-current"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const ContactInfo = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 group">
    <div
      className="
        w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
        transition-colors duration-200
      "
      style={{ backgroundColor: "var(--accent)" }}
    >
      <Icon size={16} style={{ color: "var(--primary)" }} />
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
      <span className="text-sm font-medium text-main">{value}</span>
    </div>
  </div>
);

const Contact = () => {
  const cardRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transition = "transform 0.1s ease-out";
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform 0.4s ease-out";
    card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await api.post("/contact", { name, email, subject, message });
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-bg min-h-screen w-full flex items-center justify-center px-6 py-10 overflow-hidden relative">
      {/* Glow blobs */}
      <div className="absolute top-[-120px] left-[-80px] w-[340px] h-[570px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute top-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-violet-500/20 blur-3xl" />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 w-full max-w-2xl will-change-transform transform-gpu"
      >
        <div className="surface-bg animate-in w-full rounded-[30px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
          {/* Header banner */}
          <div
            className="px-8 py-7 flex flex-col gap-1"
            style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)" }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-white">Get in Touch</h1>
            <p className="text-sm text-white/80">We'd love to hear from you. Fill out the form below.</p>
          </div>

          <div className="px-8 py-8 flex flex-col gap-6">
            {/* Contact info row */}
            <div className="flex flex-wrap gap-5">
              <ContactInfo icon={Mail} label="Email" value="hello@example.com" />
              <ContactInfo icon={Phone} label="Phone" value="+1 (555) 000-0000" />
              <ContactInfo icon={MapPin} label="Location" value="San Francisco, CA" />
            </div>

            <div className="h-px bg-white/10" />

            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center animate-in">
                <CheckCircle size={48} style={{ color: "var(--primary)" }} />
                <h2 className="text-xl font-bold text-main">Message Sent!</h2>
                <p className="text-sm text-muted max-w-xs">
                  Thanks for reaching out. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="btn btn-primary mt-2 px-6 py-2.5 rounded-2xl cursor-pointer text-sm"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-name" className="text-sm font-medium text-main">
                      Name
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      placeholder="Full Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-modern w-full px-4 py-3 rounded-2xl text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-email" className="text-sm font-medium text-main">
                      Email
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      placeholder="user@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-modern w-full px-4 py-3 rounded-2xl text-sm"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-subject" className="text-sm font-medium text-main">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="contact-subject"
                    placeholder="What's this about?"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-modern w-full px-4 py-3 rounded-2xl text-sm"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-message" className="text-sm font-medium text-main">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    placeholder="Write your message here..."
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-modern w-full px-4 py-3 rounded-2xl text-sm resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="px-4 py-3 rounded-2xl text-sm border bg-red-500/10 border-red-500/20 text-red-500">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full py-3 rounded-2xl cursor-pointer disabled:opacity-50 gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;