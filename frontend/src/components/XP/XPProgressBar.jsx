import { useContext } from "react";
import { XPContext } from "../../context/XPContext";
import { Zap, Flame, Trophy } from "lucide-react";
import { getLevelInfo } from "../../utils/xpUtils";

export default function XPProgressBar({ compact = false }) {
  const { xpData } = useContext(XPContext);

  const totalXP = xpData?.total  ?? 0;
  const streak  = xpData?.streak ?? 0;
  const info    = getLevelInfo(totalXP);

  if (compact) {
    return (
      <div className="card flex flex-col gap-3 h-full">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="flex items-center justify-center w-8 h-8 rounded-xl text-white text-xs font-bold"
              style={{ backgroundColor: info.levelColor }}
            >
              {info.level}
            </span>
            <div>
              <p className="text-xs font-bold text-main leading-tight">{info.levelName}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Level {info.level}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
            <Zap size={14} className="fill-amber-400" />
            {totalXP.toLocaleString()} XP
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] text-muted mb-1">
            <span>{info.xpIntoLevel} / {info.xpNeeded} XP</span>
            <span>{info.progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${info.progressPct}%`,
                backgroundColor: info.levelColor,
              }}
            />
          </div>
          {!info.isMaxLevel && (
            <p className="text-[10px] text-muted mt-1">
              {info.xpNeeded - info.xpIntoLevel} XP to Level {info.level + 1}
            </p>
          )}
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
            <Flame size={13} className="fill-amber-400" />
            {streak}-day streak
          </div>
        )}
      </div>
    );
  }

  // ── Full version for Profile page ──────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Level badge + name */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-lg"
          style={{ backgroundColor: info.levelColor }}
        >
          {info.level}
        </div>
        <div>
          <p className="text-lg font-bold text-main">{info.levelName}</p>
          <p className="text-sm text-muted">Level {info.level}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-amber-500 font-bold text-base">
          <Zap size={16} className="fill-amber-400" />
          {totalXP.toLocaleString()} XP
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>{info.xpIntoLevel} / {info.xpNeeded} XP into this level</span>
          <span>{info.progressPct}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${info.progressPct}%`,
              backgroundColor: info.levelColor,
            }}
          />
        </div>
        {!info.isMaxLevel ? (
          <p className="text-xs text-muted mt-1.5">
            {(info.xpNeeded - info.xpIntoLevel).toLocaleString()} XP needed to reach Level {info.level + 1}
          </p>
        ) : (
          <p className="text-xs text-muted mt-1.5 flex items-center gap-1">
            <Trophy size={12} className="text-amber-500" /> Max Level Reached!
          </p>
        )}
      </div>

      {/* Streak pill */}
      {streak > 0 && (
        <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30">
          <Flame size={14} className="text-amber-500 fill-amber-400" />
          <span className="text-sm font-semibold text-amber-500">{streak}-day streak</span>
        </div>
      )}
    </div>
  );
}