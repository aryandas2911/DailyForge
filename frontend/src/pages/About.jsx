import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Calendar,
  TrendingUp,
  User,
  Zap,
  MessageSquare,
  Send,
  CheckCircle2,
  Star,
} from "lucide-react";
 
const features = [
  {
    icon: CheckSquare,
    title: "Task Management",
    desc: "Add tasks with title, priority and deadline. Organize your day with a clean, structured task list.",
  },
  {
    icon: Calendar,
    title: "Routine Builder",
    desc: "Create and manage weekly routines easily. Drag and drop tasks into your schedule effortlessly.",
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    desc: "Track completed work and priority load clearly. Visualize your productivity trends over time.",
  },
  {
    icon: User,
    title: "Profile",
    desc: "Personalize your experience. Manage your account and preferences all in one place.",
  },
  {
    icon: Zap,
    title: "Daily Focus",
    desc: "See today's top priorities right on your dashboard. Stay focused without feeling overwhelmed.",
  },
  {
    icon: Star,
    title: "Weekly Progress",
    desc: "Monitor your weekly completion rate and build consistency one day at a time.",
  },
];
 
const steps = [
  { step: "01", title: "Sign Up", desc: "Create your free account in seconds." },
  { step: "02", title: "Add Tasks", desc: "Add your tasks with priorities and deadlines." },
  { step: "03", title: "Build Routines", desc: "Set up weekly routines and track your progress." },
];
 
const feedbackTypes = ["General Feedback", "Bug Report", "Feature Request"];
 
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" },
  }),
};
 
export default function About() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "General Feedback",
    message: "",
    rating: 0,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
 
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    // Simulate async submission
    await new Promise((res) => setTimeout(res, 1000));
    setSubmitting(false);
    setSubmitted(true);
  };
 
  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto px-6 py-12 space-y-16">
 
      {/* ── Hero ── */}
      <motion.div
        className="text-center max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-main">
          About <span className="text-primary">DailyForge</span>
        </h1>
        <p className="mt-4 text-muted text-lg leading-relaxed">
          A simple and focused planner that helps you organize your day, build
          routines and stay consistent — without overthinking.
        </p>
      </motion.div>
 
      {/* ── What is DailyForge ── */}
      <motion.section
        className="max-w-5xl mx-auto card p-8"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
      >
        <h2 className="text-xl font-semibold text-main mb-3">
          What is DailyForge?
        </h2>
        <p className="text-muted leading-relaxed">
          DailyForge is a productivity tool designed to help you plan your tasks
          in a clear and structured way. Instead of juggling messy to-do lists,
          you can organize everything visually, manage your time better, and
          actually follow through on what matters.
        </p>
      </motion.section>
 
      {/* ── Features Grid ── */}
      <section className="max-w-6xl mx-auto">
        <motion.h2
          className="text-2xl font-bold text-main text-center mb-10"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          What you can do here
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="card p-6 flex flex-col gap-3 hover:scale-[1.03] hover:bg-primary/10 hover:shadow-lg transition-all duration-300"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3 + i}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon size={20} className="text-primary" />
              </div>
              <p className="text-main font-semibold">{f.title}</p>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* ── How to Get Started ── */}
      <section className="max-w-5xl mx-auto">
        <motion.h2
          className="text-2xl font-bold text-main text-center mb-10"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={9}
        >
          How to get started
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="card p-6 flex flex-col gap-2"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={10 + i}
            >
              <span className="text-4xl font-bold text-primary/30">{s.step}</span>
              <p className="text-main font-semibold text-lg">{s.title}</p>
              <p className="text-muted text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* ── Why it matters ── */}
      <motion.section
        className="text-center max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={13}
      >
        <p className="text-muted text-base">
          Productivity isn't about doing more — it's about doing what matters,
          consistently.
        </p>
        <h3 className="mt-2 text-xl font-semibold text-primary">
          DailyForge helps you stay focused, not overwhelmed.
        </h3>
      </motion.section>
 
      {/* ── Feedback Section ── */}
      <motion.section
        className="max-w-2xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={14}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <MessageSquare size={22} className="text-primary" />
            <h2 className="text-2xl font-bold text-main">Share your Feedback</h2>
          </div>
          <p className="text-muted text-sm">
            Help us make DailyForge better. Your thoughts mean a lot to us.
          </p>
        </div>
 
        <div className="card p-8">
          {submitted ? (
            <motion.div
              className="flex flex-col items-center gap-4 py-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-main">Thank you!</h3>
              <p className="text-muted text-sm max-w-xs">
                Your feedback has been received. We appreciate you taking the
                time to help improve DailyForge.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", type: "General Feedback", message: "", rating: 0 }); }}
                className="btn btn-primary mt-2 text-sm"
              >
                Send another response
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
 
              {/* Name + Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-main">
                    Name <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="input-modern rounded-xl px-4 py-2.5 text-sm w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-main">
                    Email <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="input-modern rounded-xl px-4 py-2.5 text-sm w-full"
                  />
                </div>
              </div>
 
              {/* Feedback Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-main">Feedback type</label>
                <div className="flex flex-wrap gap-2">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, type }))}
                      className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        form.type === type
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "border-soft text-muted hover:text-main hover:border-primary/40"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Star Rating */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-main">
                  Overall experience
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, rating: star }))}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform duration-100 hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={`transition-colors duration-150 ${
                          star <= (hoverRating || form.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-main">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Share your thoughts, suggestions or issues..."
                  className="input-modern rounded-xl px-4 py-2.5 text-sm w-full resize-none"
                />
              </div>
 
              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting || !form.message.trim()}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Feedback
                  </>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.section>
 
    </div>
  );
}