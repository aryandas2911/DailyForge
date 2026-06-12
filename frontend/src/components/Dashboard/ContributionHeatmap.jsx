import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, CheckSquare, Percent, HelpCircle, Activity } from "lucide-react";
import {
  generateRealYearlyData,
  calculateHeatmapStats,
  getProductivityColorDetails
} from "../../utils/heatmapUtils";

export default function ContributionHeatmap({ tasks = [], routineTasks = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeLegendScore, setActiveLegendScore] = useState(null);
  const gridContainerRef = useRef(null);
  const cardRef = useRef(null);

  const data = useMemo(() => {
    return generateRealYearlyData(tasks, routineTasks);
  }, [tasks, routineTasks]);

  const stats = useMemo(() => calculateHeatmapStats(data), [data]);

  const monthLabels = useMemo(() => {
    const labels = [];
    for (let w = 0; w < 53; w++) {
      const dayIndex = w * 7;
      if (dayIndex < data.length) {
        const date = data[dayIndex].date;
        const monthName = date.toLocaleDateString("en-US", { month: "short" });

        if (w === 0 || (w > 0 && data[(w - 1) * 7].date.getMonth() !== date.getMonth())) {
          labels.push({
            name: monthName,
            colIndex: w,
          });
        }
      }
    }
    return labels;
  }, [data]);

  const handleInteractionStart = useCallback((e, day) => {
    const cell = e.currentTarget;
    if (!cardRef.current) return;

    const cellRect = cell.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();

    const x = cellRect.left - cardRect.left + cellRect.width / 2;
    const y = cellRect.top - cardRef.current.scrollTop - cardRect.top;

    setHoveredDay(day);
    setTooltipPos({ x, y });
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setHoveredDay(null);
  }, []);

  const formatFullDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.002,
      },
    },
  };

  const columnVariants = {
    hidden: { opacity: 0, scale: 0.92 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  };

  return (
    <div ref={cardRef} className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6 relative overflow-visible transition-colors duration-300 box-border">
      <AnimatePresence>
        {hoveredDay && (() => {
          const colIdx = hoveredDay.colIdx ?? 26;
          let translateX = "-50%";
          let arrowLeft = "50%";

          if (colIdx < 8) {
            translateX = "-15%";
            arrowLeft = "15%";
          } else if (colIdx > 44) {
            translateX = "-85%";
            arrowLeft = "85%";
          }

          return (
            <div
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: `translate(${translateX}, -100%)`,
              }}
              className="absolute z-50 pointer-events-none mt-[-8px]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 4 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="relative w-60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-3 text-xs select-none text-slate-800 dark:text-slate-200 box-border"
              >
                <div className="space-y-2">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-1.5 font-bold tracking-tight text-slate-900 dark:text-white">
                    {formatFullDate(hoveredDay.date)}
                  </div>

                  <div className="space-y-1 font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Tasks Crushed:</span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {hoveredDay.tasksCompleted} / {hoveredDay.tasksTotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Routines Run:</span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {hoveredDay.routinesCompleted}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Intensity:</span>
                      <span className={`font-bold ${
                        hoveredDay.score === 3 ? "text-emerald-500" :
                        hoveredDay.score === 2 ? "text-cyan-500" :
                        hoveredDay.score === 1 ? "text-cyan-600 dark:text-cyan-500" : "text-slate-400"
                      }`}>
                        {hoveredDay.score === 3 ? "Perfect" : hoveredDay.score === 2 ? "High" : hoveredDay.score === 1 ? "Moderate" : "None"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-bold">
                    {hoveredDay.score === 3 ? (
                      <span className="text-emerald-500 flex items-center gap-1">
                        🔥 Perfect deep-work window matching target bounds!
                      </span>
                    ) : hoveredDay.score > 0 ? (
                      <span className="text-cyan-500 flex items-center gap-1">
                        ⚡ Active baseline tracking verified.
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">No matching sync points completed</span>
                    )}
                  </div>
                </div>
                <div
                  style={{ left: arrowLeft }}
                  className="absolute top-full -translate-x-1/2 -mt-[1px] border-x-[6px] border-x-transparent border-t-[6px] border-t-white/95 dark:border-t-slate-950/95"
                />
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-xl bg-[#3b8ea0]/10 text-[#3b8ea0]">
              <Activity size={16} strokeWidth={2.5} />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Productivity Contribution
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-500/20 uppercase tracking-wider">
              Live Tracker
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Tracking real routines & task completions from your live daily workflow grid.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-[#3b8ea0]/30 group">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
            <Flame size={20} className="fill-current" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Current Streak</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.currentStreak} <span className="text-xs font-bold text-slate-400 dark:text-slate-500">days</span>
            </h3>
            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Keep the fire burning!</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-[#3b8ea0]/30 group">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <Trophy size={20} className="fill-current" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Longest Streak</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.longestStreak} <span className="text-xs font-bold text-slate-400 dark:text-slate-500">days</span>
            </h3>
            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Your peak productivity</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-[#3b8ea0]/30 group">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Productive Days</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.totalProductiveDays} <span className="text-xs font-bold text-slate-400 dark:text-slate-500">days</span>
            </h3>
            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Days with active completions</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-[#3b8ea0]/30 group">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 shrink-0">
            <Percent size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Daily Completion</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.yearlyPercentage}%
            </h3>
            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Average task completion rate</p>
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-50/40 dark:bg-slate-950/10 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 sm:p-5 overflow-x-auto scrollbar-thin relative box-border" ref={gridContainerRef}>
        <div className="min-w-[520px] sm:min-w-[640px] md:min-w-[760px] pb-1 relative box-border">
          <div className="grid grid-cols-[26px_1fr] gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 h-4 select-none relative">
            <div />
            <div className="grid grid-cols-53 gap-[2px] sm:gap-[3px] md:gap-[3.5px] relative">
              {monthLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  style={{ gridColumnStart: lbl.colIndex + 1 }}
                  className="absolute transform text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500"
                >
                  {lbl.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[26px_1fr] gap-1 items-start">
            <div className="grid grid-rows-7 h-[84px] sm:h-[98px] md:h-[112px] gap-[2px] sm:gap-[3px] md:gap-[3.5px] items-center text-[9px] font-bold text-slate-400 select-none pt-0.5">
              <span className="h-3 text-right pr-1" />
              <span className="h-3 text-right pr-1">Mon</span>
              <span className="h-3 text-right pr-1" />
              <span className="h-3 text-right pr-1">Wed</span>
              <span className="h-3 text-right pr-1" />
              <span className="h-3 text-right pr-1">Fri</span>
              <span className="h-3 text-right pr-1" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-53 gap-[2px] sm:gap-[3px] md:gap-[3.5px] h-[84px] sm:h-[98px] md:h-[112px] relative"
              role="grid"
              aria-label="Yearly productivity contribution calendar"
            >
              {Array.from({ length: 53 }).map((_, colIdx) => (
                <motion.div
                  key={colIdx}
                  variants={columnVariants}
                  className="grid grid-rows-7 gap-[2px] sm:gap-[3px] md:gap-[3.5px]"
                >
                  {Array.from({ length: 7 }).map((_, rowIdx) => {
                    const dayIdx = colIdx * 7 + rowIdx;
                    const day = data[dayIdx];
                    if (!day) return null;

                    if (day.isFuture) {
                      return (
                        <div
                          key={rowIdx}
                          role="gridcell"
                          className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] md:w-[13px] md:h-[13px] rounded-[3px] bg-transparent pointer-events-none"
                        />
                      );
                    }

                    const isPerfect = day.score === 3;
                    const dayScore = day.score ?? 0;

                    const isDimmed = activeLegendScore !== null && dayScore !== activeLegendScore;
                    const isHighlighted = activeLegendScore !== null && dayScore === activeLegendScore;
                    const isSelected = hoveredDay?.dateStr === day.dateStr;

                    let lightBg = "bg-slate-100";
                    if (dayScore === 1) lightBg = "bg-[#3b8ea0]/15";
                    if (dayScore === 2) lightBg = "bg-[#3b8ea0]/50";
                    if (dayScore === 3) lightBg = "bg-[#4eb7b3]";

                    let darkBg = "dark:bg-slate-800";
                    if (dayScore === 1) darkBg = "dark:bg-slate-800/40 dark:border dark:border-slate-800";
                    if (dayScore === 2) darkBg = "dark:bg-[#3b8ea0]/40";
                    if (dayScore === 3) darkBg = "dark:bg-[#4eb7b3]";

                    return (
                      <div
                        key={rowIdx}
                        role="gridcell"
                        tabIndex={0}
                        aria-label={`${formatFullDate(day.date)}: Tasks done: ${day.tasksCompleted} of ${day.tasksTotal}.`}
                        onMouseEnter={(e) => handleInteractionStart(e, day)}
                        onFocus={(e) => handleInteractionStart(e, day)}
                        onMouseLeave={handleInteractionEnd}
                        onBlur={handleInteractionEnd}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") handleInteractionEnd();
                        }}
                        className={`
                          w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] md:w-[13px] md:h-[13px] rounded-[3px] cursor-pointer outline-none relative transition-all duration-200
                          ${lightBg} ${darkBg}
                          ${isDimmed ? "opacity-15 scale-90" : "opacity-100"}
                          ${isHighlighted ? "scale-115 z-10 ring-1 ring-slate-400 dark:ring-white shadow-xs" : ""}
                          ${isSelected ? "scale-115 z-20 ring-2 ring-[#3b8ea0] dark:ring-white shadow-md" : ""}
                          hover:scale-115 hover:z-20 hover:ring-2 hover:ring-[#3b8ea0] dark:hover:ring-white hover:shadow-xs
                          focus:ring-2 focus:ring-[#3b8ea0] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900
                        `}
                      />
                    );
                  })}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-4">
        <div className="flex items-center gap-1.5 font-semibold">
          <HelpCircle size={14} className="text-slate-300 dark:text-slate-600" />
          <span>Hover cells for full summaries. Filter matching scales using the intensity indicators right.</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider select-none">Less</span>
          <div className="flex gap-[3.5px] items-center">
            {[0, 1, 2, 3].map((score) => {
              const dayScore = score;
              let lightBg = "bg-slate-100";
              if (score === 1) lightBg = "bg-[#3b8ea0]/15";
              if (score === 2) lightBg = "bg-[#3b8ea0]/50";
              if (score === 3) lightBg = "bg-[#4eb7b3]";

              let darkBg = "dark:bg-slate-800";
              if (score === 1) darkBg = "dark:bg-slate-800/40";
              if (score === 2) darkBg = "dark:bg-[#3b8ea0]/40";
              if (score === 3) darkBg = "dark:bg-[#4eb7b3]";

              return (
                <button
                  key={score}
                  onMouseEnter={() => setActiveLegendScore(score)}
                  onFocus={() => setActiveLegendScore(score)}
                  onMouseLeave={() => setActiveLegendScore(null)}
                  onBlur={() => setActiveLegendScore(null)}
                  aria-label={`Highlight cells matching level ${score}`}
                  className={`
                    w-[13px] h-[13px] rounded-[3px] cursor-pointer outline-none transition-all duration-150 hover:scale-115 focus:ring-1 focus:ring-[#3b8ea0]
                    ${lightBg} ${darkBg}
                    ${activeLegendScore !== null && activeLegendScore !== score ? "opacity-20" : "opacity-100"}
                  `}
                />
              );
            })}
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider select-none">More</span>
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #475569;
        }
      `}</style>
    </div>
  );
}