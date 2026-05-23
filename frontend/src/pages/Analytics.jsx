import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Download,
  Image,
  Award,
  BookOpen,
  Tag,
  Clock,
  Briefcase
} from "lucide-react";
import api from "../api/axios";
import html2canvas from "html2canvas";

export default function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/analytics");
      if (res.data.success) {
        setStats(res.data.stats);
      } else {
        setError("Failed to load analytics data");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.userMessage || "Error connecting to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // CSV Export Handler
  const exportToCSV = () => {
    if (!stats) return;
    
    // Prepare headers and rows
    const headers = ["Metric", "Value", "Details"];
    const rows = [
      ["Total Tasks", stats.summary.totalTasks, "All tasks created by user"],
      ["Completed Tasks", stats.summary.completedTasksCount, "Tasks finished successfully"],
      ["Due Tasks", stats.summary.dueTasksCount, "Pending tasks"],
      ["Overall Completion Rate", `${stats.summary.overallCompletionRate}%`, "Percentage of tasks completed"],
      ["Current Streak", `${stats.streaks.currentStreak} days`, "Consecutive active days"],
      ["Best Streak", `${stats.streaks.bestStreak} days`, "All-time record streak"],
      ["Total Routines", stats.summary.totalRoutines, "Routines constructed"],
      ["Total Routine Tasks Scheduled", stats.summary.totalRoutineTasksCount, "Tasks run via weekly grid"],
    ];

    // Append Category details
    rows.push([]);
    rows.push(["Category", "Total Tasks", "Completed Tasks", "Completion Rate"]);
    stats.categoryStats.forEach((cat) => {
      rows.push([cat.category, cat.total, cat.completed, `${cat.rate}%`]);
    });

    // Append Priority details
    rows.push([]);
    rows.push(["Priority", "Total Tasks", "Completed Tasks", "Completion Rate"]);
    stats.priorityStats.forEach((prio) => {
      rows.push([prio.priority, prio.total, prio.completed, `${prio.rate}%`]);
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DailyForge_Productivity_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Image Export Handler
  const exportToImage = async () => {
    const element = document.getElementById("analytics-dashboard-content");
    if (!element) return;
    try {
      const buttonArea = document.getElementById("export-buttons-area");
      if (buttonArea) buttonArea.style.display = "none";

      const canvas = await html2canvas(element, {
        backgroundColor: "#0f172a", // Match theme background
        useCORS: true,
        scale: 2,
      });

      if (buttonArea) buttonArea.style.display = "flex";

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "DailyForge_Analytics_Dashboard.png";
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export image:", err);
      alert("Failed to export dashboard as image");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center app-bg gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted font-medium animate-pulse">
          Analyzing routines and tasks…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center app-bg px-4">
        <div className="card max-w-md w-full text-center space-y-4 shadow-xl border-soft bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <Award size={48} className="text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-main">Something went wrong</h2>
          <p className="text-sm text-muted">{error}</p>
          <button className="btn btn-primary w-full" onClick={fetchAnalytics}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Calculations for Custom SVG Charts ---
  // 1. Donut Categories
  const colors = [
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Violet
    "#ef4444", // Red
    "#6b7280", // Gray
  ];

  let catCumulative = 0;
  const donutCatSegments = stats.categoryStats.map((cat, idx) => {
    const totalCount = stats.categoryStats.reduce((sum, c) => sum + c.total, 0);
    const percentage = totalCount > 0 ? cat.total / totalCount : 0;
    const strokeDash = percentage * 314.159;
    const strokeOffset = 314.159 - strokeDash + catCumulative;
    catCumulative -= strokeDash;
    return {
      ...cat,
      percentage: Math.round(percentage * 100),
      strokeDash,
      strokeOffset,
      color: colors[idx % colors.length],
    };
  });

  // 2. Donut Priorities
  let prioCumulative = 0;
  const prioColors = {
    High: "#ef4444",   // Red
    Medium: "#f59e0b", // Amber
    Low: "#10b981",    // Green
  };
  const donutPrioSegments = stats.priorityStats.map((prio) => {
    const totalCount = stats.priorityStats.reduce((sum, p) => sum + p.total, 0);
    const percentage = totalCount > 0 ? prio.total / totalCount : 0;
    const strokeDash = percentage * 314.159;
    const strokeOffset = 314.159 - strokeDash + prioCumulative;
    prioCumulative -= strokeDash;
    return {
      ...prio,
      percentage: Math.round(percentage * 100),
      strokeDash,
      strokeOffset,
      color: prioColors[prio.priority],
    };
  });

  // 3. Daily Bar Chart Calculations
  const maxDailyValue = Math.max(
    ...stats.dailyProgress.map((d) => Math.max(d.total, d.completed, 1))
  );

  // 4. Trend Line Chart Calculations
  const trendMax = Math.max(...stats.weeklyTrend.map((w) => w.rate), 100);
  const trendPoints = stats.weeklyTrend.map((w, idx) => {
    const x = 50 + idx * 95; // Spacing
    const y = 200 - (w.rate / trendMax) * 150; // Inverted scale
    return { x, y, label: w.label, rate: w.rate };
  });

  const trendPathD = trendPoints.length
    ? `M ${trendPoints[0].x} ${trendPoints[0].y} ` +
      trendPoints
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ")
    : "";

  const trendAreaD = trendPoints.length
    ? `${trendPathD} L ${trendPoints[trendPoints.length - 1].x} 200 L ${trendPoints[0].x} 200 Z`
    : "";

  return (
    <div
      id="analytics-dashboard-content"
      className="min-h-screen w-full max-w-[1440px] mx-auto app-bg px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 shadow-md rounded-xl bg-(--surface) gap-4 border border-soft backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg p-2 border border-soft text-muted hover:bg-[#d0f6e3]/30 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-main flex items-center gap-2">
                Productivity Analytics
              </h1>
              <p className="text-sm text-muted">
                Insights and habit metrics tracking your consistency over time.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Area */}
        <div id="export-buttons-area" className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={exportToCSV}
            className="flex-1 md:flex-none btn btn-primary flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={exportToImage}
            className="flex-1 md:flex-none btn btn-primary flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Image size={16} />
            Export PNG
          </button>
        </div>
      </header>

      {/* Grid of Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-in delay-100">
        <div className="card flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:scale-102 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Tasks</p>
            <h3 className="text-2xl font-bold text-main">{stats.summary.totalTasks}</h3>
            <p className="text-xs text-muted/70">{stats.summary.dueTasksCount} still pending</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:scale-102 hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Completed</p>
            <h3 className="text-2xl font-bold text-main">{stats.summary.completedTasksCount}</h3>
            <p className="text-xs text-muted/70">Tasks finished successfully</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:scale-102 hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Completion Rate</p>
            <h3 className="text-2xl font-bold text-main">{stats.summary.overallCompletionRate}%</h3>
            <p className="text-xs text-muted/70">Overall task efficiency</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:scale-102 hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Saved Routines</p>
            <h3 className="text-2xl font-bold text-main">{stats.summary.totalRoutines}</h3>
            <p className="text-xs text-muted/70">{stats.summary.totalRoutineTasksCount} scheduled items</p>
          </div>
        </div>
      </section>

      {/* Streaks & Leaderboard Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full animate-in delay-200">
        {/* Streak Tracker Card */}
        <div className="col-span-12 lg:col-span-7 card bg-gradient-to-tr from-amber-500/10 to-red-500/10 dark:from-amber-950/20 dark:to-red-950/20 border border-soft/50 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 z-10 relative">
            <div className="relative flex-shrink-0 animate-bounce">
              <div className="absolute inset-0 bg-amber-500/40 rounded-full blur-xl scale-120"></div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-lg">
                <Flame size={38} className="text-white fill-white/20" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-xl font-bold text-main flex items-center justify-center sm:justify-start gap-2">
                Consistency Streak
              </h3>
              <p className="text-sm text-muted">
                Complete at least one task daily to fuel your productivity streak!
              </p>
              
              <div className="flex justify-center sm:justify-start items-center gap-8 pt-2">
                <div className="text-center">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
                    {stats.streaks.currentStreak}
                  </span>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted mt-1">Current Streak</p>
                </div>
                <div className="h-8 w-px bg-slate-300 dark:bg-slate-700"></div>
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-main">
                    {stats.streaks.bestStreak}
                  </span>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted mt-1">Best Record</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard - Most Completed Tasks */}
        <div className="col-span-12 lg:col-span-5 card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-main mb-3 flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              Most Completed Tasks
            </h3>
            {stats.mostFrequentTasks.length === 0 ? (
              <p className="text-sm text-muted text-center py-6 italic">No completed tasks yet.</p>
            ) : (
              <ul className="space-y-3">
                {stats.mostFrequentTasks.map((task, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-soft/30 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-main truncate max-w-[180px] sm:max-w-[260px]">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-xs bg-primary/20 text-[#3b8ea0] px-2 py-0.5 rounded-full font-semibold">
                      {task.count}x
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* SVG Analytics Charts (Daily Bar & Weekly Trend Line) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full animate-in delay-300">
        {/* Daily Progress Bar Chart */}
        <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft relative">
          <h3 className="text-base font-semibold text-main mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            Daily Tasks Status (Last 7 Days)
          </h3>
          
          <div className="w-full flex justify-center py-2">
            <svg viewBox="0 0 400 240" className="w-full max-w-[450px]">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                const y = 200 - p * 160;
                return (
                  <g key={idx}>
                    <line x1="30" y1={y} x2="380" y2={y} stroke="#e2e8f0" strokeDasharray="4" strokeWidth="0.5" className="dark:stroke-slate-800" />
                    <text x="5" y={y + 4} fontSize="8" className="fill-slate-400 font-medium">
                      {Math.round(p * maxDailyValue)}
                    </text>
                  </g>
                );
              })}

              {/* Draw Bars */}
              {stats.dailyProgress.map((day, idx) => {
                const spacing = 50;
                const baseX = 30 + idx * spacing + 10;
                const totalBarHeight = (day.total / maxDailyValue) * 160;
                const completedBarHeight = (day.completed / maxDailyValue) * 160;

                const totalY = 200 - totalBarHeight;
                const completedY = 200 - completedBarHeight;

                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="cursor-pointer"
                  >
                    {/* Background hover bar highlight */}
                    {hoveredBar === idx && (
                      <rect x={baseX - 4} y="20" width="28" height="190" fill="#4eb7b3/10" rx="4" opacity="0.1" />
                    )}

                    {/* Total Tasks Bar */}
                    <rect
                      x={baseX}
                      y={totalY}
                      width="8"
                      height={totalBarHeight}
                      fill="#e2e8f0"
                      className="dark:fill-slate-700 transition-all duration-300"
                      rx="2"
                    />

                    {/* Completed Tasks Bar */}
                    <rect
                      x={baseX + 10}
                      y={completedY}
                      width="8"
                      height={completedBarHeight}
                      fill="#10b981"
                      className="transition-all duration-300"
                      rx="2"
                    />

                    {/* X Axis labels */}
                    <text x={baseX + 9} y="215" textAnchor="middle" fontSize="9" className="fill-slate-500 font-semibold dark:fill-slate-400">
                      {day.label}
                    </text>
                  </g>
                );
              })}

              {/* Tooltip Overlay */}
              {hoveredBar !== null && (
                <g transform={`translate(${30 + hoveredBar * 50 + 20}, ${20})`}>
                  <rect x="-45" y="-5" width="90" height="26" fill="#1e293b" rx="6" className="shadow-lg" />
                  <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                    Completed: {stats.dailyProgress[hoveredBar].completed}
                  </text>
                  <text x="0" y="16" textAnchor="middle" fill="#94a3b8" fontSize="7">
                    Total Due: {stats.dailyProgress[hoveredBar].total}
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="flex justify-center gap-4 text-xs font-semibold pt-2">
            <div className="flex items-center gap-1.5 text-muted">
              <span className="w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-sm"></span>
              Due Tasks
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
              Completed Tasks
            </div>
          </div>
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft">
          <h3 className="text-base font-semibold text-main mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-500" />
            Weekly Completion Rate Trend
          </h3>

          <div className="w-full flex justify-center py-2">
            <svg viewBox="0 0 400 240" className="w-full max-w-[450px]">
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((rate, idx) => {
                const y = 200 - (rate / 100) * 150;
                return (
                  <g key={idx}>
                    <line x1="30" y1={y} x2="380" y2={y} stroke="#e2e8f0" strokeDasharray="4" strokeWidth="0.5" className="dark:stroke-slate-800" />
                    <text x="5" y={y + 3} fontSize="8" className="fill-slate-400 font-medium">
                      {rate}%
                    </text>
                  </g>
                );
              })}

              {/* Area Gradient under curve */}
              <defs>
                <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {trendAreaD && (
                <path d={trendAreaD} fill="url(#trend-gradient)" className="transition-all duration-500" />
              )}

              {/* Trend Path Line */}
              {trendPathD && (
                <path
                  d={trendPathD}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500 animate-pulse"
                />
              )}

              {/* Trend Interactive Points */}
              {trendPoints.map((pt, idx) => (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint === idx ? "6" : "4"}
                    fill="#ffffff"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    className="transition-all duration-200"
                  />
                  <text x={pt.x} y="215" textAnchor="middle" fontSize="9" className="fill-slate-500 font-semibold dark:fill-slate-400">
                    {pt.label}
                  </text>
                </g>
              ))}

              {/* Tooltip Overlay */}
              {hoveredPoint !== null && (
                <g transform={`translate(${trendPoints[hoveredPoint].x}, ${trendPoints[hoveredPoint].y - 32})`}>
                  <rect x="-35" y="-5" width="70" height="18" fill="#1e293b" rx="5" />
                  <text x="0" y="7" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                    Rate: {trendPoints[hoveredPoint].rate}%
                  </text>
                </g>
              )}
            </svg>
          </div>

          <p className="text-[10px] text-center text-muted italic">
            Visualizes task completion percentage rates across previous rolling weeks.
          </p>
        </div>
      </section>

      {/* Donut Charts (Category Breakdown & Priority Distribution) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full animate-in delay-300">
        {/* Category Breakdown Donut */}
        <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="text-center md:text-left w-full md:w-auto">
            <h3 className="text-base font-semibold text-main mb-1 flex items-center justify-center md:justify-start gap-2">
              <Tag size={18} className="text-[#3b8ea0]" />
              Tasks by Category
            </h3>
            <p className="text-xs text-muted mb-4">Completed ratios grouped by tags.</p>

            <ul className="space-y-1.5 text-xs text-muted font-medium">
              {donutCatSegments.map((seg, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }}></span>
                  <span className="font-semibold text-main">{seg.category}</span>
                  <span>({seg.completed}/{seg.total})</span>
                  <span className="text-slate-400">{seg.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Donut Render */}
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-slate-800" />
              {donutCatSegments.map((seg, idx) => (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={`${seg.strokeDash} 314.159`}
                  strokeDashoffset={seg.strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-main">
                {stats.categoryStats.reduce((sum, c) => sum + c.completed, 0)}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Done</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Donut */}
        <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="text-center md:text-left w-full md:w-auto">
            <h3 className="text-base font-semibold text-main mb-1 flex items-center justify-center md:justify-start gap-2">
              <Briefcase size={18} className="text-amber-500" />
              Priority Distribution
            </h3>
            <p className="text-xs text-muted mb-4">Volume distribution of tasks by importance.</p>

            <ul className="space-y-1.5 text-xs text-muted font-medium">
              {donutPrioSegments.map((seg, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }}></span>
                  <span className="font-semibold text-main">{seg.priority}</span>
                  <span>({seg.completed}/{seg.total})</span>
                  <span className="text-slate-400">{seg.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Donut Render */}
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-slate-800" />
              {donutPrioSegments.map((seg, idx) => (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={`${seg.strokeDash} 314.159`}
                  strokeDashoffset={seg.strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-main">
                {stats.priorityStats.reduce((sum, p) => sum + p.total, 0)}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Total</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
