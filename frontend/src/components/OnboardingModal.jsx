import { useState } from "react";
import {
  Sparkles,
  CheckCircle,
  Calendar,
  BarChart2,
  FileText,
  MousePointer,
  AlertTriangle,
  ClipboardList,
  Flame,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to DailyForge",
    description:
      "Your personal productivity system. Build habits, plan your week, and actually stick to your goals.",
    features: [
      { Icon: CheckCircle, colorClass: "text-teal-600 dark:text-teal-400", text: "Smart task management", sub: "Create, categorize and prioritize tasks" },
      { Icon: Calendar, colorClass: "text-indigo-600 dark:text-indigo-400", text: "Visual routine builder", sub: "Drag tasks into your weekly grid" },
      { Icon: BarChart2, colorClass: "text-green-600 dark:text-green-400", text: "Progress tracking", sub: "Watch your streaks grow over time" },
    ],
  },
  {
    icon: FileText,
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
    icon: Calendar,
    title: "Design your week",
    description:
      "Drag tasks from your library into the weekly grid. Build a routine you can actually follow every week.",
    cards: [
      { Icon: MousePointer, iconColor: "text-teal-500 dark:text-teal-400", title: "Drag and drop", sub: "Place tasks on any day and time" },
      { Icon: AlertTriangle, iconColor: "text-amber-500 dark:text-amber-400", title: "Conflict detection", sub: "No overlapping tasks allowed" },
      { Icon: ClipboardList, iconColor: "text-violet-500 dark:text-violet-400", title: "Save routines", sub: "Reuse your schedule every week" },
      { Icon: Flame, iconColor: "text-orange-500 dark:text-orange-400", title: "Build streaks", sub: "Stay consistent, track progress" },
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
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-7 shadow-2xl -translate-y-8 md:-translate-y-12">

        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Step ${step + 1} of ${STEPS.length}`}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-7">
          {STEPS.map((_, i) => (
            <div
              key={i}
              aria-current={i === step ? "step" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-teal-400"
                  : i < step
                  ? "w-6 bg-teal-600 dark:bg-teal-700"
                  : "w-2 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="text-teal-500 dark:text-teal-400 flex justify-center mb-5">
          <IconComponent size={40} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-center mb-2">
          {current.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-5">
          {current.description}
        </p>

        {/* Step 1 features */}
        {current.features && (
          <div className="flex flex-col gap-3 mb-5">
            {current.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <f.Icon size={18} className={f.colorClass} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{f.text}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{f.sub}</div>
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
                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5"
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-xs ${
                    c.done
                      ? "border-teal-400 text-teal-400"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {c.done && <Check size={10} strokeWidth={3} />}
                </div>
                <span
                  className={`text-sm ${
                    c.done ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"
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
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center"
              >
                <div className={`flex justify-center mb-1 ${c.iconColor}`}>
                  <c.Icon size={20} strokeWidth={1.75} />
                </div>
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-0.5">{c.title}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {step === 0 ? (
            <button
              onClick={finish}
              aria-label="Skip onboarding tour"
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Skip tour
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s - 1)}
              aria-label="Go to previous step"
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              aria-label="Go to next step"
              className="flex-[2] py-2.5 rounded-lg bg-teal-400 dark:bg-teal-500 text-slate-900 dark:text-slate-900 text-sm font-medium hover:bg-teal-500 dark:hover:bg-teal-400 transition-colors flex items-center justify-center gap-1"
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={finish}
              aria-label="Start using DailyForge"
              className="flex-[2] py-2.5 rounded-lg bg-teal-400 dark:bg-teal-500 text-slate-900 dark:text-slate-900 text-sm font-medium hover:bg-teal-500 dark:hover:bg-teal-400 transition-colors"
            >
              Let&apos;s go!
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;
