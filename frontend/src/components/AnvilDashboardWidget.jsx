import React from 'react';
import { Flame, Coins, ShieldCheck, Zap } from 'lucide-react';

export default function AnvilDashboardWidget({
  currentStreak,
  totalPoints,
  freezeCount,
  weeklyProgress,
  onPurchaseFreeze
}) {
  return (
    <div className="w-full bg-slate-900 text-white rounded-xl p-4 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Metrics Block */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Flame Streak</span>
            <span className="text-sm font-bold tracking-tight">{currentStreak} Days Consistent</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Forge Points</span>
            <span className="text-sm font-bold tracking-tight text-yellow-300">{totalPoints} 🪙</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Active Freezes</span>
              <span className="text-sm font-bold tracking-tight">{freezeCount} Available</span>
            </div>
            {totalPoints >= 200 && (
              <button
                type="button"
                onClick={onPurchaseFreeze}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition"
              >
                Buy (+1) for 200p
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Track Context Slider */}
      <div className="w-full md:w-64 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-400" /> Weekly Adherence
          </span>
          <span className="font-semibold text-indigo-300">{weeklyProgress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${Math.min(Math.max(weeklyProgress, 0), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}