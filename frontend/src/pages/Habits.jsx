import { useState, useEffect } from "react";
import { Plus, Award, Flame, Trash2, Calendar, Check, X } from "lucide-react";
import api from "../api/axios";

// Helper to format Date object to YYYY-MM-DD in local time
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get("/habits");
      if (res.data.success) {
        setHabits(res.data.habits || []);
      } else {
        setError("Failed to fetch habits");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggleHabit = async (habitId) => {
    try {
      const todayStr = getLocalDateString();
      const res = await api.put(`/habits/${habitId}/toggle`, { date: todayStr });
      if (res.data.success) {
        // Update local state instantly
        setHabits((prev) =>
          prev.map((habit) =>
            habit._id === habitId ? res.data.habit : habit
          )
        );
      }
    } catch (err) {
      console.error("Error toggling habit:", err);
      alert("Failed to toggle habit completion status");
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm("Are you sure you want to delete this habit? All progress logs will be lost.")) {
      return;
    }
    try {
      const res = await api.delete(`/habits/${habitId}`);
      if (res.data.success) {
        setHabits((prev) => prev.filter((h) => h._id !== habitId));
      }
    } catch (err) {
      console.error("Error deleting habit:", err);
      alert("Failed to delete habit");
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Habit name is required");
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError("");
      const res = await api.post("/habits", { name, description });
      if (res.data.success) {
        setHabits((prev) => [res.data.habit, ...prev]);
        setIsModalOpen(false);
        setName("");
        setDescription("");
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Failed to create habit");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to generate the last 7 days list with details
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: getLocalDateString(d),
        label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        fullName: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const todayStr = getLocalDateString();

  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto app-bg px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 shadow-md rounded-xl bg-(--surface) gap-4 border border-soft backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-main flex items-center gap-2">
            <Award className="text-primary" size={28} />
            Habit Tracker
          </h1>
          <p className="text-sm text-muted mt-1">
            Build permanent habits, track consistency streaks, and forge your perfect routines.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto btn btn-primary flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <Plus size={18} />
          Add New Habit
        </button>
      </header>

      {/* Main Grid Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted font-medium animate-pulse">Loading habits…</p>
        </div>
      ) : error ? (
        <div className="card text-center max-w-md mx-auto p-6 border-red-500/20">
          <h3 className="text-lg font-bold text-main">Failed to Load</h3>
          <p className="text-sm text-muted mt-2">{error}</p>
          <button onClick={fetchHabits} className="btn btn-primary mt-4 w-full">Try Again</button>
        </div>
      ) : habits.length === 0 ? (
        <div className="card text-center max-w-md mx-auto p-8 border-soft/50 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-muted">
            <Calendar size={28} />
          </div>
          <h3 className="text-lg font-bold text-main">No Habits Tracked Yet</h3>
          <p className="text-sm text-muted mt-2 max-w-xs leading-relaxed">
            Consistently tracking habits is the foundation of long-term success. Add your first habit now!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary mt-6 w-full cursor-pointer"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Quick Stats Overview */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-soft backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl text-white shadow-md animate-pulse">
                  <Flame size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Global Consistency</h3>
                  <p className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent mt-0.5">
                    {Math.max(...habits.map((h) => h.currentStreak || 0), 0)} Day Streak
                  </p>
                  <p className="text-xs text-muted/70 mt-1">Your current highest active streak!</p>
                </div>
              </div>
            </div>

            <div className="card border border-soft p-5 space-y-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <h3 className="font-semibold text-main text-sm uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-primary" />
                Streak Milestones
              </h3>
              <div className="space-y-3">
                {habits.map((habit) => (
                  <div key={habit._id} className="flex items-center justify-between text-xs border-b border-soft/20 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-main truncate max-w-[150px]">{habit.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted/80">Best: <strong className="text-main">{habit.bestStreak || 0}d</strong></span>
                      <span className="flex items-center gap-0.5 font-semibold text-orange-500">
                        <Flame size={12} className="fill-orange-500/10" />
                        {habit.currentStreak || 0}d
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Habits Daily List Grid */}
          <div className="lg:col-span-8 space-y-4">
            {habits.map((habit) => {
              const isCompletedToday = habit.logs.includes(todayStr);

              return (
                <div
                  key={habit._id}
                  className={`card relative border border-soft/50 transition-all p-5 hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900/90 ${
                    isCompletedToday ? "border-l-4 border-l-green-500" : ""
                  }`}
                >
                  {/* Left content & Title */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleHabit(habit._id)}
                      className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 ${
                        isCompletedToday
                          ? "bg-green-500 border-green-500 text-white hover:bg-green-600"
                          : "border-soft hover:bg-slate-50 dark:hover:bg-slate-800 text-transparent"
                      }`}
                      aria-label={`Mark ${habit.name} ${isCompletedToday ? "incomplete" : "complete"}`}
                    >
                      <Check size={18} className="stroke-[3]" />
                    </button>

                    <div className="min-w-0">
                      <h3
                        className={`text-base font-semibold leading-tight transition-all duration-200 cursor-pointer ${
                          isCompletedToday ? "line-through text-muted/60" : "text-main"
                        }`}
                        onClick={() => handleToggleHabit(habit._id)}
                      >
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-xs text-muted mt-1 leading-relaxed italic line-clamp-2">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side: Streak and 7 Days Log Grid */}
                  <div className="flex flex-wrap items-center gap-6 self-stretch md:self-auto justify-between border-t border-soft/20 md:border-0 pt-3 md:pt-0">
                    {/* Weekly tracker visualization */}
                    <div className="flex items-center gap-2">
                      {last7Days.map((day) => {
                        const isLogged = habit.logs.includes(day.dateStr);
                        const isToday = day.dateStr === todayStr;

                        return (
                          <div
                            key={day.dateStr}
                            title={`${day.fullName}: ${isLogged ? "Completed" : "Not Done"}`}
                            className="flex flex-col items-center gap-1.5"
                          >
                            <span className="text-[9px] font-bold text-muted uppercase tracking-wider">{day.label}</span>
                            <button
                              onClick={() => {
                                if (isToday) handleToggleHabit(habit._id);
                              }}
                              disabled={!isToday}
                              className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                isLogged
                                  ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30"
                                  : isToday
                                  ? "border border-dashed border-soft hover:bg-slate-100 dark:hover:bg-slate-800 text-muted cursor-pointer"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-transparent"
                              }`}
                            >
                              {isLogged ? "✓" : ""}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Streak Count */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-semibold bg-orange-50 dark:bg-orange-950/20 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-900/30 text-orange-600 dark:text-orange-400">
                        <Flame size={14} className="fill-orange-500/10" />
                        {habit.currentStreak || 0}d
                      </div>
                      
                      <button
                        onClick={() => handleDeleteHabit(habit._id)}
                        className="rounded-xl border border-soft/50 p-2 text-muted hover:text-red-500 hover:bg-red-500/5 transition cursor-pointer"
                        title="Delete habit"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* modal create new habit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4">
          <div className="card card-primary w-full max-w-md p-6 bg-white dark:bg-[#1e293b] border border-soft shadow-2xl rounded-3xl animate-in scale-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-soft/20">
              <h3 className="text-lg font-bold text-main">Add New Habit</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-muted hover:text-main cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-main mb-1.5">Habit Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Drink 3L Water, Reading, Coding"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-soft bg-transparent px-4 py-2.5 text-sm text-main placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-main mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Briefly state your purpose or details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-soft bg-transparent px-4 py-2.5 text-sm text-main placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]"
                  maxLength={150}
                />
              </div>

              {formError && (
                <p className="text-xs font-semibold text-red-500">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-soft/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-soft text-main font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary px-5 py-2.5 rounded-xl font-semibold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Habit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
