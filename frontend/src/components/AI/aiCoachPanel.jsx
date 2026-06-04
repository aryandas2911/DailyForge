import { useState } from "react";
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, AlertCircle, Lock } from "lucide-react";
import api from "../../api/axios";
import { useAISettings } from "../../context/AISettingsContext";

export default function AiCoachPanel() {
  const { isPro, aiCoachEnabled } = useAISettings();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    if (!isPro || !aiCoachEnabled) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ai/coach");
      if (res.data.success) setSummary(res.data.summary);
      else setError("Failed to load AI summary.");
    } catch (err) {
      setError(err.response?.data?.message || "Error loading AI coach.");
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="surface-bg border-soft rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
        <Lock className="w-8 h-8 text-muted" />
        <h3 className="text-lg font-semibold text-main">AI Routine Coach</h3>
        <p className="text-sm text-muted max-w-xs">
          Upgrade to <span className="font-semibold text-[#4eb7b3]">Pro</span> to unlock your weekly AI-powered coaching summary.
        </p>
        <span className="text-xs px-3 py-1 rounded-full bg-[#4eb7b3]/10 text-[#4eb7b3] font-medium">Pro Feature</span>
      </div>
    );
  }

  if (!aiCoachEnabled) {
    return (
      <div className="surface-bg border-soft rounded-2xl p-6 flex flex-col items-center gap-3 text-center opacity-60">
        <Sparkles className="w-8 h-8 text-muted" />
        <p className="text-sm text-muted">AI Coach is disabled. Enable it in Profile → AI Settings.</p>
      </div>
    );
  }

  return (
    <div className="surface-bg border-soft rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#4eb7b3]" />
          <h3 className="text-lg font-semibold text-main">AI Routine Coach</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#4eb7b3]/10 text-[#4eb7b3] font-medium">Pro</span>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-[#4eb7b3] text-white hover:bg-[#3da6a2] transition disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {summary ? "Refresh" : "Generate Summary"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!summary && !loading && (
        <p className="text-sm text-muted text-center py-4">
          Click <strong>Generate Summary</strong> to get your personalised weekly analysis.
        </p>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-2 py-6 text-muted">
          <RefreshCw className="w-6 h-6 animate-spin text-[#4eb7b3]" />
          <p className="text-sm">Analysing your week...</p>
        </div>
      )}

      {summary && !loading && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Tasks This Week", value: summary.weekTasks },
              { label: "Completed", value: summary.completed },
              { label: "Completion Rate", value: `${summary.completionRate}%` },
              { label: "Current Streak", value: `${summary.streak}d` },
            ].map((s) => (
              <div key={s.label} className="border-soft rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-[#4eb7b3]">{s.value}</p>
                <p className="text-xs text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {summary.overdueHighPriority > 0 && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{summary.overdueHighPriority} overdue high-priority task(s) need your attention.</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-main">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Coach Suggestions
            </div>
            <ul className="flex flex-col gap-2">
              {summary.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted border-soft rounded-xl p-3">
                  <TrendingUp className="w-4 h-4 text-[#4eb7b3] flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted text-right">
            Generated at {new Date(summary.generatedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}