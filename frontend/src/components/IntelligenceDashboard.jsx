import { useState, useEffect } from "react";
import api from "../api/axios";
import { 
  BrainCircuit, 
  BatteryWarning, 
  Activity, 
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingDown,
  Calendar
} from "lucide-react";

export default function IntelligenceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        setLoading(true);
        const res = await api.get("/intelligence");
        if (res.data.success) {
          setData(res.data.intelligence);
        } else {
          setError("Failed to load intelligence data.");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to intelligence engine.");
      } finally {
        setLoading(false);
      }
    };
    fetchIntelligence();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-soft">
        <BrainCircuit className="w-8 h-8 text-primary animate-pulse mb-4" />
        <p className="text-sm text-muted font-medium">Analyzing patterns...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full p-6 text-center bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl border border-red-200 dark:border-red-800">
        <p>{error || "Data unavailable"}</p>
      </div>
    );
  }

  // Calculate gauge parameters
  const score = data.burnoutScore;
  const radius = 60;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let riskColor = "#10b981"; // emerald
  if (score >= 75) riskColor = "#ef4444"; // red
  else if (score >= 50) riskColor = "#f59e0b"; // amber

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BrainCircuit className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-main">Productivity Intelligence</h2>
          <p className="text-sm text-muted">AI-powered insights based on your workload & consistency.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Burnout Risk Meter */}
        <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft col-span-1 flex flex-col items-center justify-center py-8">
          <h3 className="text-sm font-semibold text-main mb-6 w-full text-left flex items-center gap-2 px-2">
            <BatteryWarning className="w-4 h-4 text-orange-500" />
            Burnout Risk
          </h3>
          
          <div className="relative w-48 h-24 flex items-end justify-center overflow-hidden">
            <svg viewBox="0 0 140 70" className="w-full">
              {/* Background Track */}
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke="#e2e8f0"
                className="dark:stroke-slate-800"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Score Track */}
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke={riskColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center bottom-0">
              <span className="text-3xl font-extrabold text-main" style={{ color: riskColor }}>
                {score}%
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted mt-1">
                {data.riskLevel} Risk
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-8 px-4 text-center">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">
              <p className="text-xl font-bold text-main">{data.dailyWorkloadHours}h</p>
              <p className="text-[10px] uppercase font-bold text-muted mt-1">Daily Workload</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">
              <p className="text-xl font-bold text-main">{data.overduePercentage}%</p>
              <p className="text-[10px] uppercase font-bold text-muted mt-1">Overdue Rate</p>
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft col-span-1 md:col-span-2">
          <h3 className="text-sm font-semibold text-main mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            Smart Recommendations
          </h3>
          <div className="space-y-3">
            {data.recommendations.map((rec, idx) => {
              let icon = <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
              let bgClass = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20";
              
              if (rec.type === "urgent") {
                icon = <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />;
                bgClass = "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20";
              } else if (rec.type === "workload" || rec.type === "schedule") {
                icon = <Clock className="w-5 h-5 text-amber-500 shrink-0" />;
                bgClass = "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20";
              } else if (rec.type === "fatigue") {
                icon = <TrendingDown className="w-5 h-5 text-orange-500 shrink-0" />;
                bgClass = "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20";
              }

              return (
                <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 transition hover:-translate-y-0.5 ${bgClass}`}>
                  {icon}
                  <p className="text-sm font-medium text-main leading-relaxed">{rec.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Weekly Workload Balance Chart */}
        <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft">
          <h3 className="text-sm font-semibold text-main mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Weekly Routine Balance
          </h3>
          <div className="flex items-end justify-between h-48 pt-4">
            {data.weeklyWorkload.map((day, idx) => {
              const maxHours = Math.max(...data.weeklyWorkload.map(d => d.hours), 8);
              const heightPct = Math.max(5, (day.hours / maxHours) * 100);
              const isHigh = day.hours > 6;
              
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="text-xs font-bold text-main opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.hours}h
                  </div>
                  <div className="w-full px-1 sm:px-2 flex justify-center h-full items-end">
                    <div 
                      className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${isHigh ? 'bg-orange-400 dark:bg-orange-500/80' : 'bg-blue-400 dark:bg-blue-500/80'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-soft">
          <h3 className="text-sm font-semibold text-main mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            30-Day Activity Heatmap
          </h3>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-soft/50">
            {data.activityHeatmap.map((day, idx) => {
              let colorClass = "bg-slate-200 dark:bg-slate-700";
              if (day.intensity === 1) colorClass = "bg-emerald-200 dark:bg-emerald-900/60";
              else if (day.intensity === 2) colorClass = "bg-emerald-400 dark:bg-emerald-600";
              else if (day.intensity === 3) colorClass = "bg-emerald-600 dark:bg-emerald-400";

              return (
                <div 
                  key={idx} 
                  title={`${day.date}: ${day.count} tasks`}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-sm ${colorClass} hover:ring-2 ring-primary ring-offset-1 dark:ring-offset-slate-900 transition-all cursor-help`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted justify-end">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/60"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-400"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
