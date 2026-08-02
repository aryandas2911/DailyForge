import { useState } from "react";

const STEPS = [
  {
    icon: "✨",
    title: "Welcome to DailyForge",
    description:
      "Your personal productivity system. Build habits, plan your week, and actually stick to your goals.",
    features: [
      { icon: "✅", bgLight: "bg-emerald-50 dark:bg-emerald-950/30", textLight: "text-emerald-700 dark:text-emerald-400", text: "Smart task management", sub: "Create, categorize and prioritize tasks" },
      { icon: "📅", bgLight: "bg-indigo-50 dark:bg-indigo-950/30", textLight: "text-indigo-700 dark:text-indigo-400", text: "Visual routine builder", sub: "Drag tasks into your weekly grid" },
      { icon: "📊", bgLight: "bg-teal-50 dark:bg-teal-950/30", textLight: "text-teal-700 dark:text-teal-400", text: "Progress tracking", sub: "Watch your streaks grow over time" },
    ],
  },
  {
    icon: "📝",
    title: "Create your first task",
    description:
      "Tasks are the building blocks of your routine. Add details, set a category and assign priority.",
    checks: [
      { done: true, text: "Give your task a clear name" },
      { done: true, text: "Pick a category — Work, Health, Learning..." },
      { done: false, text: "Set duration and priority" },
      { done: false, text: "Add it to your routine" },
    ],
  },
  {
    icon: "🗓️",
    title: "Design your week",
    description:
      "Drag tasks from your library into the weekly grid. Build a routine you can actually follow every week.",
    cards: [
      { icon: "🖱️", borderMarker: "border-teal-500", title: "Drag and drop", sub: "Place tasks on any day and time" },
      { icon: "⚠️", borderMarker: "border-amber-500", title: "Conflict detection", sub: "No overlapping tasks allowed" },
      { icon: "📋", borderMarker: "border-violet-500", title: "Save routines", sub: "Reuse your schedule every week" },
      { icon: "🔥", borderMarker: "border-orange-500", title: "Build streaks", sub: "Stay consistent, track progress" },
    ],
  },
];

const OnboardingModal = () => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(!localStorage.getItem("hasSeenOnboarding"));

  const finish = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-7 shadow-2xl transition-all duration-300">
        
        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[#3b8ea0] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center gap-2 mb-7">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-[#3b8ea0]"
                  : i < step
                  ? "w-6 bg-[#3b8ea0]/40"
                  : "w-2 bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>

        <div className="text-4xl text-center mb-5">{current.icon}</div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
          {current.title}
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-6">
          {current.description}
        </p>

        {current.features && (
          <div className="flex flex-col gap-3 mb-6">
            {current.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${f.bgLight} ${f.textLight}`}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{f.text}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {current.checks && (
          <div className="flex flex-col gap-2 mb-6">
            {current.checks.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                    c.done
                      ? "border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {c.done && "✓"}
                </div>
                <span
                  className={`text-sm font-medium ${
                    c.done ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {c.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {current.cards && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {current.cards.map((c, i) => (
              <div
                key={i}
                className={`bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 border-t-4 ${c.borderMarker} rounded-xl p-3.5 text-center shadow-xs`}
              >
                <div className="text-xl mb-1.5">{c.icon}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">{c.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step === 0 ? (
            <button
              onClick={finish}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Skip tour
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-[2] py-2.5 rounded-xl bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold shadow-xs hover:shadow-md transition cursor-pointer"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={finish}
              className="flex-[2] py-2.5 rounded-xl bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold shadow-xs hover:shadow-md transition cursor-pointer"
            >
              Let's go! 🚀
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;