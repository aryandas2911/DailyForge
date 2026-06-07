import { useState, useMemo, useRef, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
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

  // Compute real contribution data dynamically from live props
  const data = useMemo(() => {
    return generateRealYearlyData(tasks, routineTasks);
  }, [tasks, routineTasks]);

  // Memoize activity stats to prevent redundant calculations on rerender
  const stats = useMemo(() => calculateHeatmapStats(data), [data]);

  // Compute month labels and their column indices dynamically
  const monthLabels = useMemo(() => {
    const labels = [];
    // 53 columns total (weeks)
    for (let w = 0; w < 53; w++) {
      const dayIndex = w * 7;
      if (dayIndex < data.length) {
        const date = data[dayIndex].date;
        const monthName = date.toLocaleDateString("en-US", { month: "short" });

        // If first column or month changes compared to previous week column
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

  // Handle cell hover and focus (for accessibility)
  const handleInteractionStart = useCallback((e, day) => {
    const cell = e.currentTarget;
    if (!cardRef.current) return;

    const cellRect = cell.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();

    const x = cellRect.left - cardRect.left + cellRect.width / 2;
    const y = cellRect.top - cardRect.top;

    setHoveredDay(day);
    setTooltipPos({ x, y });
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setHoveredDay(null);
  }, []);

  // Format date for tooltip display
  const formatFullDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Staggered column (week) animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <div ref={cardRef} className="card w-full border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 relative overflow-hidden transition-all duration-300">

      {/* Background radial soft light for aesthetic premium look */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#14b8a6]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Tooltip Popup (Dynamic Absolute Positioning relative to Card) */}
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
              className="absolute z-50 pointer-events-none mt-[-10px]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="relative w-64 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl rounded-xl p-3.5 text-xs select-none text-slate-800 dark:text-slate-200"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatFullDate(hoveredDay.date)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Tasks Done:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {hoveredDay.tasksCompleted} / {hoveredDay.tasksTotal}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Routines Completed:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {hoveredDay.routinesCompleted}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Productivity:</span>
                      <span className={`font-bold ${
                        hoveredDay.score === 3 ? "text-emerald-600 dark:text-emerald-400 text-glow" :
                        hoveredDay.score === 2 ? "text-cyan-600 dark:text-cyan-400" :
                        hoveredDay.score === 1 ? "text-teal-600 dark:text-teal-500" : "text-slate-500"
                      }`}>
                        {getProductivityColorDetails(hoveredDay.score).label.split(" (")[0]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[10px]">
                    {hoveredDay.score === 3 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold animate-pulse">
                        🔥 Perfect productivity streak active!
                      </span>
                    ) : hoveredDay.score > 0 ? (
                      <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1 font-bold">
                        ⚡ Keep it going!
                      </span>
                    ) : (
                      <span className="text-slate-500 font-bold">No active completions</span>
                    )}
                  </div>
                </div>
                {/* Tooltip pointer arrow */}
                <div
                  style={{ left: arrowLeft }}
                  className="absolute top-full -translate-x-1/2 -mt-[1px] border-x-[6px] border-x-transparent border-t-[6px] border-t-white/95 dark:border-t-slate-950/95"
                />
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5 z-10 relative">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Activity size={18} />
            </span>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Productivity Contribution
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wider">
              Live Tracker
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 mt-1">
            Tracking real routines & task completions from your live daily workflow.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">

        {/* Current Streak */}
        <div className="bg-white/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/60 p-3 sm:p-4 gap-3 sm:gap-4 min-w-0 rounded-xl flex items-center transition-all hover:border-[#14b8a6]/30 group hover-lift shadow-xs dark:shadow-none">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-400">Current Streak</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.currentStreak} <span className="text-xs font-bold text-slate-700 dark:text-slate-400">days</span>
            </h3>
            <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">Keep the fire burning!</p>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/60 p-4 rounded-xl flex items-center gap-4 transition-all hover:border-[#14b8a6]/30 group hover-lift shadow-xs dark:shadow-none">
          <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-200">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-400">Longest Streak</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.longestStreak} <span className="text-xs font-bold text-slate-700 dark:text-slate-400">days</span>
            </h3>
            <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">Your peak productivity</p>
          </div>
        </div>

        {/* Total Productive Days */}
        <div className="bg-white/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/60 p-4 rounded-xl flex items-center gap-4 transition-all hover:border-[#14b8a6]/30 group hover-lift shadow-xs dark:shadow-none">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-200">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-400">Productive Days</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.totalProductiveDays} <span className="text-xs font-bold text-slate-700 dark:text-slate-400">days</span>
            </h3>
            <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">Days with active completions</p>
          </div>
        </div>

        {/* Yearly Productivity Average */}
        <div className="bg-white/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/60 p-4 rounded-xl flex items-center gap-4 transition-all hover:border-[#14b8a6]/30 group hover-lift shadow-xs dark:shadow-none">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-200">
            <Percent size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-400">Day-wise Completion</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.yearlyPercentage}%
            </h3>
            <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">Average daily task completion rate</p>
          </div>
        </div>
      </div>

      {/* Main Heatmap Container */}
      <div className="relative z-10">

        {/* Loaded Heatmap Display */}
        <div
          className="w-full bg-white/70 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/50 rounded-xl p-3 sm:p-5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative"
          ref={gridContainerRef}
        >
          {/* Inner Wrapper containing relative position for absolute elements */}
          <div className="min-w-[520px] sm:min-w-[640px] md:min-w-[760px] pb-2 relative">

              {/* Grid Header Month Labels */}
              <div className="grid grid-cols-[30px_1fr] gap-1 text-[10px] font-extrabold text-slate-700 dark:text-slate-400 mb-2.5 h-4 select-none relative">
                <div /> {/* spacing for weekday column */}
                <div className="grid grid-cols-53 gap-[2px] sm:gap-[3px] md:gap-[3.5px] relative">
                  {monthLabels.map((lbl, idx) => (
                    <span
                      key={idx}
                      style={{ gridColumnStart: lbl.colIndex + 1 }}
                      className="absolute transform text-slate-800 dark:text-slate-400 font-extrabold uppercase tracking-wider"
                    >
                      {lbl.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grid Body: Weekday Labels + 53x7 Calendar Squares */}
              <div className="grid grid-cols-[30px_1fr] gap-1 items-start">

                {/* Weekday Column */}
                <div className="grid grid-rows-7 h-[112px] gap-[3.5px] items-center text-[9px] font-extrabold text-slate-800/90 dark:text-slate-400 uppercase select-none pt-0.5">
                  <span aria-hidden="true" className="h-3 text-right pr-1"></span>
                  <span className="h-3 text-right pr-1">Mon</span>
                  <span aria-hidden="true" className="h-3 text-right pr-1"></span>
                  <span className="h-3 text-right pr-1">Wed</span>
                  <span aria-hidden="true" className="h-3 text-right pr-1"></span>
                  <span className="h-3 text-right pr-1">Fri</span>
                  <span aria-hidden="true" className="h-3 text-right pr-1"></span>
                </div>

                {/* Calendar Column Flow Grid */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-53 gap-[2px] sm:gap-[3px] md:gap-[3.5px] h-[84px] sm:h-[98px] md:h-[112px] relative"
                  role="grid"
                  aria-label="Yearly productivity contribution calendar"
                >
                  {/* Outer weeks mapped to Framer Motion columns for smooth sweep animation */}
                  {Array.from({ length: 53 }).map((_, colIdx) => (
                    <motion.div
                      key={colIdx}
                      variants={columnVariants}
                      className="grid grid-rows-7 gap-[3.5px]"
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

                        const colorDetails = getProductivityColorDetails(day.score);
                        const isPerfect = day.score === 3;

                        // Check legend hover filter conditions
                        const isDimmed = activeLegendScore !== null && day.score !== activeLegendScore;
                        const isHighlighted = activeLegendScore !== null && day.score === activeLegendScore;
                        const isSelected = hoveredDay?.dateStr === day.dateStr;

                        return (
                          <div
                            key={rowIdx}
                            role="gridcell"
                            tabIndex={0}
                            aria-label={`${formatFullDate(day.date)}: Tasks done: ${day.tasksCompleted} of ${day.tasksTotal}. routines Completed: ${day.routinesCompleted}. productivity: ${getProductivityColorDetails(day.score).label}`}
                            onMouseEnter={(e) => handleInteractionStart(e, day)}
                            onFocus={(e) => handleInteractionStart(e, day)}
                            onMouseLeave={handleInteractionEnd}
                            onBlur={handleInteractionEnd}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") handleInteractionEnd();
                            }}
                            className={`
                             w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] md:w-[13px] md:h-[13px] rounded-[3px] cursor-pointer outline-none relative transition-all duration-300
                              border border-transparent
                              ${colorDetails.bgClass}
                              ${isPerfect ? colorDetails.glowClass : ""}
                              ${isDimmed ? "opacity-20 scale-90" : "opacity-100"}
                              ${isHighlighted ? "scale-115 z-10 !border-slate-500 dark:!border-white shadow-lg" : ""}
                              ${isSelected ? "scale-120 z-20 !border-slate-600 dark:!border-slate-200 shadow-xl" : ""}
                              hover:scale-120 hover:z-20 hover:!border-slate-600 dark:hover:!border-slate-200 hover:shadow-xl
                              focus:ring-2 focus:ring-[#14b8a6] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:scale-115 focus:z-10
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
      </div>

      {/* Grid Legend & Instructions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-400 border-t border-slate-300 dark:border-slate-800/80 pt-4 z-10 relative">
        <div className="flex items-center gap-1">
          <HelpCircle size={13} className="text-slate-700 dark:text-slate-500" />
          <span>Hover / Focus cells for details. Hover legend intensities to filter.</span>
        </div>

        {/* Interactive Legend Scale */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-slate-700 dark:text-slate-500 font-extrabold uppercase select-none">Less</span>
          <div className="flex gap-[3.5px] items-center">
            {[0, 1, 2, 3].map((score) => {
              const details = getProductivityColorDetails(score);
              const isPerfect = score === 3;
              return (
                <button
                  key={score}
                  onMouseEnter={() => setActiveLegendScore(score)}
                  onFocus={() => setActiveLegendScore(score)}
                  onMouseLeave={() => setActiveLegendScore(null)}
                  onBlur={() => setActiveLegendScore(null)}
                  aria-label={`Highlight cells matching ${details.label}`}
                  className={`
                    w-[13px] h-[13px] rounded-[3px] cursor-pointer outline-none transition-all duration-200 hover:scale-120 focus:ring-2 focus:ring-[#14b8a6]
                    ${details.bgClass}
                    ${isPerfect ? "shadow-[0_0_6px_rgba(13,148,136,0.25)] dark:shadow-[0_0_6px_rgba(153,246,228,0.4)] border border-teal-500/20 dark:border-[#ccfbf1]/40" : ""}
                    ${activeLegendScore !== null && activeLegendScore !== score ? "opacity-30" : "opacity-100 scale-105"}
                  `}
                  title={details.label}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-slate-700 dark:text-slate-500 font-extrabold uppercase select-none">More</span>
        </div>
      </div>

      {/* Styled inline components to handle premium visual requirements like custom glows */}
      <style>{`
        .text-glow {
          text-shadow: 0 0 8px rgba(16,185,129,0.4);
        }
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
