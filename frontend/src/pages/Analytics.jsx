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
import { cachedGet } from "../utils/apiCache";
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
      const res = await cachedGet("/analytics");
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

  const exportToCSV = () => {
    if (!stats) return;
    
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
      ["Total Journal Entries", stats.summary.totalJournalsCount || 0, "Personal journal entries logged"],
    ];

    rows.push([]);
    rows.push(["Category", "Total Tasks", "Completed Tasks", "Completion Rate"]);
    stats.categoryStats.forEach((cat) => {
      rows.push([cat.category, cat.total, cat.completed, `${cat.rate}%`]);
    });

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

  const exportToImage = async () => {
    const element = document.getElementById("analytics-dashboard-content");
    if (!element) return;
    try {
      const buttonArea = document.getElementById("export-buttons-area");
      if (buttonArea) buttonArea.style.display = "none";

      const canvas = await html2canvas(element, {
        backgroundColor: "#0f172a",
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="w-12 h-12 border-4 border-[#3b8ea0] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold animate-pulse">
          Analyzing routines and tasks…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full text-center p-6 space-y-4 shadow-xl">
          <Award size={48} className="text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <button className="w-full py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer" onClick={fetchAnalytics}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#ef4444",
    "#6b7280",
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

  let prioCumulative = 0;
  const prioColors = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#10b981",
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

  const maxDailyValue = Math.max(
    ...stats.dailyProgress.map((d) => Math.max(d.total, d.completed, 1))
  );

  const trendMax = Math.max(...stats.weeklyTrend.map((w) => w.rate), 100);
  const trendPoints = stats.weeklyTrend.map((w, idx) => {
    const x = 50 + idx * 95;
    const y = 200 - (w.rate / trendMax) * 150;
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
      className="min-h-screen w-full max-w-[1440px] mx-auto bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in transition-colors duration-300 w-full box-border"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 shadow-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-xl gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl p-2 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Productivity Analytics
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Insights and habit metrics tracking your consistency over time.
              </p>
            </div>
          </div>
        </div>

        <div id="export-buttons-area" className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={exportToCSV}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={exportToImage}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Image size={16} />
            Export PNG
          </button>
        </div>
      </header>

      {/* Grid of Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full animate-in delay-100">
        <div className="card flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:scale-102 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-500/10 text-main rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Tasks</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.summary.totalTasks}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{stats.summary.dueTasksCount} still pending</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 border-l-4 border-l-emerald-500 transition-colors duration-300">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.summary.completedTasksCount}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Tasks finished successfully</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 border-l-4 border-l-purple-500 transition-colors duration-300">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completion Rate</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.summary.overallCompletionRate}%</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Overall task efficiency</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 border-l-4 border-l-amber-500 transition-colors duration-300">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Saved Routines</p>
            <h3 className="text-2xl font-bold text-main">{stats.summary.totalRoutines}</h3>
            <p className="text-xs text-muted/70">{stats.summary.totalRoutineTasksCount} scheduled items</p>
          </div>
        </div>

        <div 
          onClick={() => navigate("/daily-journal")}
          className="card flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:scale-102 hover:shadow-lg hover:border-cyan-500/50 transition-all duration-300 border-l-4 border-l-cyan-500 cursor-pointer"
        >
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl">
            <BookOpen size={24} className="text-cyan-500" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Journal Entries</p>
            <h3 className="text-2xl font-bold text-main">{stats.summary.totalJournalsCount || 0}</h3>
            <p className="text-xs text-muted/70">Click to write journal entries</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full animate-in delay-150">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs border-l-4 border-l-red-500 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Burnout Score
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {stats.adaptiveAnalytics?.averageBurnoutScore || 0}%
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                Lower is healthier
              </p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <Flame size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs border-l-4 border-l-emerald-500 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Consistency Score
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {stats.adaptiveAnalytics?.averageConsistencyScore || 0}%
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                Long-term stability indicator
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs border-l-4 border-l-amber-500 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Recovery Mode Users
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {stats.adaptiveAnalytics?.recoveryModeCount || 0}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                Active recovery routines
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs border-l-4 border-l-purple-500 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                High Fatigue Alerts
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {stats.adaptiveAnalytics?.highFatigueCount || 0}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                Burnout risk detected
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Award size={24} />
            </div>
          </div>
        </div>
      </section>

      <div className="bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Smart Recovery Insight
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              {stats.adaptiveAnalytics?.averageBurnoutScore >= 70
                ? "High burnout patterns detected. Consider reducing workload and enabling recovery routines."
                : stats.adaptiveAnalytics?.averageConsistencyScore >= 80
                ? "Excellent consistency detected. Maintain balance to avoid future burnout."
                : "Steady progress improves long-term productivity sustainability."}
            </p>
          </div>

                    <div
              className={`px-4 py-2 rounded-full text-sm font-semibold w-fit
              ${
                stats.adaptiveAnalytics?.averageBurnoutScore >= 70
                  ? "bg-red-500/10 text-red-500"
                  : stats.adaptiveAnalytics?.averageConsistencyScore >= 80
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-blue-500/10 text-blue-500 dark:text-slate-200"
              }`}
            >

              {stats.adaptiveAnalytics?.averageBurnoutScore >= 70
                ? "Burnout Risk"
                : stats.adaptiveAnalytics?.averageConsistencyScore >= 80
                ? "Sustainable Progress"
                : "Stable Routine"}

            </div>

        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs transition-colors duration-300">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award size={18} className="text-[#3b8ea0]" />
            Adaptive Recommendation
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {stats.adaptiveAnalytics?.averageBurnoutScore >= 70
              ? "Your analytics suggest elevated burnout activity. Consider reducing routine intensity, shortening sessions, and enabling recovery mode for better long-term sustainability."
              : stats.adaptiveAnalytics?.averageConsistencyScore >= 80
              ? "Your consistency patterns are strong and sustainable. Continue maintaining balanced productivity habits while allowing occasional recovery periods."
              : "Moderate productivity trends detected. Small consistent progress and flexible routines can improve long-term habit stability."}
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full animate-in delay-200">
        <div className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden transition-colors duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-6 z-10 relative">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md">
                <Flame size={38} className="text-white fill-white/10" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2 flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Consistency Streak
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Complete at least one task daily to fuel your productivity streak!
              </p>
              
              <div className="flex justify-center sm:justify-start items-center gap-8 pt-2">
                <div className="text-center">
                  <span className="text-3xl font-black text-[#3b8ea0] dark:text-[#4eb7b3]">
                    {stats.streaks.currentStreak}
                  </span>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Current Streak</p>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                <div className="text-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {stats.streaks.bestStreak}
                  </span>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Best Record</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-colors duration-300">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              Most Completed Tasks
            </h3>
            {stats.mostFrequentTasks.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6 italic font-medium">No completed tasks yet.</p>
            ) : (
              <ul className="space-y-3 pl-0 mt-0 list-none">
                {stats.mostFrequentTasks.map((task, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#3b8ea0]/10 text-[#3b8ea0] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#3b8ea0] dark:text-slate-200 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                      {task.count}x
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full animate-in delay-300">
        {/* Daily Progress Bar Chart */}
        <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft relative">
          <h3 className="text-base font-semibold text-main mb-4 flex items-center gap-2">
            <Clock size={18} className="text-main" />
            Daily Tasks Status (Last 7 Days)
          </h3>
          
          <div className="w-full flex justify-center py-2 overflow-x-auto">
            <svg viewBox="0 0 400 240" className="w-full min-w-[340px] max-w-[450px]">
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                const y = 200 - p * 160;
                return (
                  <g key={idx}>
                    <line x1="30" y1={y} x2="380" y2={y} stroke="#e2e8f0" strokeDasharray="4" strokeWidth="0.5" className="dark:stroke-slate-800" />
                    <text x="5" y={y + 4} fontSize="8" className="fill-slate-400 dark:fill-slate-500 font-bold">
                      {Math.round(p * maxDailyValue)}
                    </text>
                  </g>
                );
              })}

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
                    {hoveredBar === idx && (
                      <rect x={baseX - 4} y="20" width="28" height="190" fill="#3b8ea0" rx="4" opacity="0.06" />
                    )}

                    <rect
                      x={baseX}
                      y={totalY}
                      width="8"
                      height={totalBarHeight}
                      fill="#e2e8f0"
                      className="dark:fill-slate-700 transition-all duration-300"
                      rx="2"
                    />

                    <rect
                      x={baseX + 10}
                      y={completedY}
                      width="8"
                      height={completedBarHeight}
                      fill="#10b981"
                      className="transition-all duration-300"
                      rx="2"
                    />

                    <text x={baseX + 9} y="215" textAnchor="middle" fontSize="9" className="fill-slate-500 font-bold dark:fill-slate-400">
                      {day.label}
                    </text>
                  </g>
                );
              })}

              {hoveredBar !== null && (
                <g transform={`translate(${30 + hoveredBar * 50 + 20}, ${20})`}>
                  <rect x="-45" y="-5" width="90" height="26" fill="#1e293b" rx="6" />
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

          <div className="flex justify-center gap-4 text-xs font-bold pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-2">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-xs"></span>
              Due Tasks
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs"></span>
              Completed Tasks
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-300">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-500" />
            Weekly Completion Rate Trend
          </h3>

          <div className="w-full flex justify-center py-2 overflow-x-auto">
            <svg viewBox="0 0 400 240" className="w-full min-w-[340px] max-w-[450px]">
              {[0, 25, 50, 75, 100].map((rate, idx) => {
                const y = 200 - (rate / 100) * 150;
                return (
                  <g key={idx}>
                    <line x1="30" y1={y} x2="380" y2={y} stroke="#e2e8f0" strokeDasharray="4" strokeWidth="0.5" className="dark:stroke-slate-800" />
                    <text x="5" y={y + 3} fontSize="8" className="fill-slate-400 dark:fill-slate-500 font-bold">
                      {rate}%
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {trendAreaD && (
                <path d={trendAreaD} fill="url(#trend-gradient)" className="transition-all duration-500" />
              )}

              {trendPathD && (
                <path
                  d={trendPathD}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
              )}

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
                  <text x={pt.x} y="215" textAnchor="middle" fontSize="9" className="fill-slate-500 font-bold dark:fill-slate-400">
                    {pt.label}
                  </text>
                </g>
              ))}

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

          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium italic mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            Visualizes task completion percentage rates across previous rolling weeks.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full animate-in delay-300">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-around gap-6 transition-colors duration-300">
          <div className="text-center md:text-left w-full md:w-auto flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-center md:justify-start gap-2">
              <Tag size={18} className="text-[#3b8ea0]" />
              Tasks by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">Completed ratios grouped by tags.</p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-semibold pl-0 mt-0 list-none">
              {donutCatSegments.map((seg, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{seg.category}</span>
                  <span className="font-medium text-slate-400">({seg.completed}/{seg.total})</span>
                  <span className="ml-auto font-bold text-slate-500 dark:text-slate-400">{seg.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-40 h-40 shrink-0">
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
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {stats.categoryStats.reduce((sum, c) => sum + c.completed, 0)}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Done</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-around gap-6 transition-colors duration-300">
          <div className="text-center md:text-left w-full md:w-auto flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-center md:justify-start gap-2">
              <Briefcase size={18} className="text-amber-500" />
              Priority Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">Volume distribution of tasks by importance.</p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-semibold pl-0 mt-0 list-none">
              {donutPrioSegments.map((seg, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                  <span className="text-slate-800 dark:text-slate-200">{seg.priority}</span>
                  <span className="font-medium text-slate-400">({seg.completed}/{seg.total})</span>
                  <span className="ml-auto font-bold text-slate-500 dark:text-slate-400">{seg.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-40 h-40 shrink-0">
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
              <span className="text-xl font-black text-slate-900 dark:text-white">
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