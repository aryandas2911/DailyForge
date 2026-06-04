import { useEffect, useState } from "react";
import { AlertTriangle, X, Flame } from "lucide-react";
import api from "../../api/axios";
import { useAISettings } from "../../context/AISettingsContext";

export default function OverloadWarningBanner() {
  const { isPro, overloadEnabled } = useAISettings();
  const [overload, setOverload] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isPro || !overloadEnabled) return;
    api.get("/ai/overload")
      .then((res) => { if (res.data.success) setOverload(res.data.overload); })
      .catch(() => {});
  }, [isPro, overloadEnabled]);

  if (!isPro || !overloadEnabled || !overload || overload.level === "ok" || dismissed) return null;

  const isBurnout = overload.level === "burnout";
  const colors = isBurnout
    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400";

  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${colors}`}>
      {isBurnout
        ? <Flame className="w-5 h-5 flex-shrink-0 mt-0.5" />
        : <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          {isBurnout ? "⚠️ Burnout Risk Detected" : "⚡ Overload Warning"}
        </p>
        <p className="text-sm mt-0.5">{overload.message}</p>
        {overload.suggestion && (
          <p className="text-xs mt-1 opacity-80 italic">{overload.suggestion}</p>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}