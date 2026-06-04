import { useState } from "react";
import { Wand2, Loader2, Lock, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../api/axios";
import { useAISettings } from "../../context/AISettingsContext";

export default function NLRoutineInput({ onRoutineGenerated }) {
  const { isPro, nlRoutineEnabled } = useAISettings();
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/ai/routine", { goal });
      if (res.data.success) {
        onRoutineGenerated(res.data.routine);
        setGoal("");
        setOpen(false);
      } else {
        setError("Failed to generate routine.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error generating routine.");
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="surface-bg border-soft rounded-2xl p-4 flex items-center gap-3">
        <Lock className="w-5 h-5 text-muted flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-main">Natural Language Routine</p>
          <p className="text-xs text-muted">
            Upgrade to <span className="text-[#4eb7b3] font-medium">Pro</span> to generate routines from a goal description.
          </p>
        </div>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#4eb7b3]/10 text-[#4eb7b3] font-medium whitespace-nowrap">Pro</span>
      </div>
    );
  }

  if (!nlRoutineEnabled) return null;

  return (
    <div className="surface-bg border-soft rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-main hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
      >
        <Wand2 className="w-4 h-4 text-[#4eb7b3]" />
        Generate Routine from Goal
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#4eb7b3]/10 text-[#4eb7b3] font-medium ml-1">AI</span>
        <span className="ml-auto">
          {open
            ? <ChevronUp className="w-4 h-4 text-muted" />
            : <ChevronDown className="w-4 h-4 text-muted" />
          }
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-soft/50">
          <p className="text-xs text-muted pt-2">
            Describe your goal in plain English — e.g.{" "}
            <em>"I want to get fit and exercise daily"</em> or{" "}
            <em>"Help me study for my exams on weekdays"</em>.
          </p>
          <textarea
            rows={3}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe your goal..."
            className="w-full px-3 py-2 text-sm surface-bg border-soft rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#4eb7b3]/40"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={loading || !goal.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#4eb7b3] text-white text-sm font-medium hover:bg-[#3da6a2] transition disabled:opacity-60 cursor-pointer"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Wand2 className="w-4 h-4" />
            }
            {loading ? "Generating..." : "Generate Routine"}
          </button>
        </div>
      )}
    </div>
  );
}