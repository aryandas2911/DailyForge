import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import api from "../../api/axios";
import { useAISettings } from "../../context/AISettingsContext";

export default function AdaptiveNudge() {
  const { isPro, nudgesEnabled } = useAISettings();
  const [nudge, setNudge] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isPro || !nudgesEnabled) return;
    api.get("/ai/nudge")
      .then((res) => { if (res.data.success) setNudge(res.data.nudge); })
      .catch(() => {});
  }, [isPro, nudgesEnabled]);

  if (!isPro || !nudgesEnabled || !nudge || dismissed) return null;

  return (
    <div className="flex items-start gap-3 surface-bg border-soft rounded-2xl p-4">
      <MessageCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#4eb7b3]" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-[#4eb7b3] mb-0.5">AI Nudge</p>
        <p className="text-sm text-main">{nudge}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="opacity-50 hover:opacity-100 transition cursor-pointer flex-shrink-0"
      >
        <X className="w-4 h-4 text-muted" />
      </button>
    </div>
  );
}