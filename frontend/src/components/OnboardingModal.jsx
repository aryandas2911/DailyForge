import { useState} from "react";

const STEPS = [
  {
    icon: "✨",
    title: "Welcome to DailyForge",
    description:
      "Your personal productivity system. Build habits, plan your week, and actually stick to your goals.",
    features: [
      { icon: "✅", color: "#0e3a30", text: "Smart task management", sub: "Create, categorize and prioritize tasks" },
      { icon: "📅", color: "#1a1535", text: "Visual routine builder", sub: "Drag tasks into your weekly grid" },
      { icon: "📊", color: "#0e2a10", text: "Progress tracking", sub: "Watch your streaks grow over time" },
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
      { icon: "🖱️", color: "#2dd4bf", title: "Drag and drop", sub: "Place tasks on any day and time" },
      { icon: "⚠️", color: "#f59e0b", title: "Conflict detection", sub: "No overlapping tasks allowed" },
      { icon: "📋", color: "#a78bfa", title: "Save routines", sub: "Reuse your schedule every week" },
      { icon: "🔥", color: "#f97316", title: "Build streaks", sub: "Stay consistent, track progress" },
    ],
  },
];

const OnboardingModal = () => {
  
  const [step, setStep] = useState(0);

  const [visible, setVisible] = useState(
  !localStorage.getItem("hasSeenOnboarding")
);

  const finish = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#141f2b] border border-[#1e3a4a] rounded-2xl w-full max-w-md p-7 shadow-2xl">

        {/* Progress bar */}
        <div className="h-1 bg-[#1e2e3d] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-7">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-teal-400"
                  : i < step
                  ? "w-6 bg-teal-700"
                  : "w-2 bg-[#1e2e3d]"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="text-4xl text-center mb-5">{current.icon}</div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-[#e2eaf2] text-center mb-2">
          {current.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-[#7a9bb5] text-center leading-relaxed mb-5">
          {current.description}
        </p>

        {/* Step 1 features */}
        {current.features && (
          <div className="flex flex-col gap-3 mb-5">
            {current.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: f.color }}
                >
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#c5d8e8]">{f.text}</div>
                  <div className="text-xs text-[#5a7a92]">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2 checklist */}
        {current.checks && (
          <div className="flex flex-col gap-2 mb-5">
            {current.checks.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-[#0f1923] border border-[#1e2e3d] rounded-lg px-3 py-2.5"
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-xs ${
                    c.done
                      ? "border-teal-400 text-teal-400"
                      : "border-[#1e3a4a]"
                  }`}
                >
                  {c.done && "✓"}
                </div>
                <span
                  className={`text-sm ${
                    c.done ? "text-[#c5d8e8]" : "text-[#5a7a92]"
                  }`}
                >
                  {c.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Step 3 cards */}
        {current.cards && (
          <div className="grid grid-cols-2 gap-2 mb-5">
            {current.cards.map((c, i) => (
              <div
                key={i}
                className="bg-[#0f1923] border border-[#1e2e3d] rounded-lg p-3 text-center"
              >
                <div className="text-xl mb-1">{c.icon}</div>
                <div className="text-xs font-medium text-[#c5d8e8] mb-0.5">{c.title}</div>
                <div className="text-xs text-[#5a7a92]">{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {step === 0 ? (
            <button
              onClick={finish}
              className="flex-1 py-2.5 rounded-lg border border-[#1e3a4a] text-[#5a7a92] text-sm"
            >
              Skip tour
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-2.5 rounded-lg border border-[#1e3a4a] text-[#5a7a92] text-sm"
            >
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-[2] py-2.5 rounded-lg bg-teal-400 text-[#0f1923] text-sm font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={finish}
              className="flex-[2] py-2.5 rounded-lg bg-teal-400 text-[#0f1923] text-sm font-medium"
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