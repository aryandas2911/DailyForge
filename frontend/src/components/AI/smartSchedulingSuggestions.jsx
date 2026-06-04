import { useEffect, useState } from "react";
import { Clock, TrendingUp, Lock } from "lucide-react";
import api from "../../api/axios";
import { useAISettings } from "../../context/AISettingsContext";

export default function SmartSchedulingSuggestions() {
  const { isPro, schedulingEnabled } = useAISettings();
  const [suggestions, setSuggestions] = useState([]);
  const [basedOn, setBasedOn] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isPro || !schedulingEnabled) return;
    api.get("/ai/scheduling")
      .then((res) => {
        if (res.data.success) {
          setSuggestions(res.data.suggestions);
          setBasedOn(res.data.basedOnTasks);
          setLoaded(true);
        }
      })
      .catch(() => {});
  }, [isPro, schedulingEnabled]);

  if (!isPro) {
    return (
      <div className="surface-bg border-soft rounded-2xl p-4 flex items-center gap-3">
        <Lock className="w-5 h-5 text-muted flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-main">Smart Scheduling</p>
          <p className="text-xs text-muted">Upgrade to Pro to see your peak productivity time slots.</p>
        </div>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#4eb7b3]/10 text-[#4eb7b3] font-medium whitespace-nowrap">Pro</span>
      </div>
    );
  }

  if (!schedulingEnabled || !loaded) return null;

  return (
    <div className="surface-bg border-soft rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[#4eb7b3]" />
        <p className="text-sm font-semibold text-main">Your Peak Productivity Times</p>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#4eb7b3]/10 text-[#4eb7b3] font-medium ml-auto">AI</span>
      </div>
      {basedOn < 5
        ? <p className="text-xs text-muted">Complete more tasks to unlock personalised suggestions. Showing defaults for now.</p>
        : <p className="text-xs text-muted">Based on {basedOn} completed tasks</p>
      }
      <div className="flex flex-col gap-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-center gap-3 border-soft rounded-xl p-2.5">
            <Clock className="w-4 h-4 text-[#4eb7b3] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-main">{s.timeSlot}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
            {s.completions > 0 && (
              <span className="text-xs text-muted">{s.completions} completions</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}