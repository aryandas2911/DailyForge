import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  X, 
  ArrowLeft,
  Filter,
  Smile,
  Flame,
  Award,
  TrendingUp,
  Tag,
  BarChart2,
  Edit2,
  AlertTriangle
} from "lucide-react";
import api from "../api/axios.js";
import { cachedGet, invalidate } from "../utils/apiCache";
import useDebounce from "../hooks/useDebounce";
import LoadingSpinner from "../components/common/LoadingSpinner";

const MOODS = [
  { value: "happy", label: "Happy", emoji: "😃", color: "bg-green-500/10 text-green-500 border-green-500/20", glow: "shadow-[0_0_15px_rgba(34,197,94,0.4)] border-green-500 scale-105" },
  { value: "calm", label: "Calm", emoji: "😌", color: "bg-teal-500/10 text-teal-500 border-teal-500/20", glow: "shadow-[0_0_15px_rgba(20,184,166,0.4)] border-teal-500 scale-105" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "bg-slate-500/10 text-slate-500 dark:text-slate-300 border-slate-500/20", glow: "shadow-[0_0_15px_rgba(100,116,139,0.4)] border-slate-500 scale-105" },
  { value: "stressed", label: "Stressed", emoji: "🤯", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", glow: "shadow-[0_0_15px_rgba(249,115,22,0.4)] border-orange-500 scale-105" },
  { value: "sad", label: "Sad", emoji: "😢", color: "bg-blue-500/10 text-blue-500 dark:text-slate-200 border-blue-500/20", glow: "shadow-[0_0_15px_rgba(59,130,246,0.4)] border-blue-500 scale-105" },
  { value: "energetic", label: "Energetic", emoji: "⚡", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", glow: "shadow-[0_0_15px_rgba(234,179,8,0.4)] border-yellow-500 scale-105" },
  { value: "tired", label: "Tired", emoji: "😴", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", glow: "shadow-[0_0_15px_rgba(99,102,241,0.4)] border-indigo-500 scale-105" },
];

export default function DailyJournal() {
  const navigate = useNavigate();

  // Tab state: "workspace" or "insights"
  const [activeTab, setActiveTab] = useState("workspace");

  // Flow state: isEditing determines whether the editor form is open or if we are viewing read-only.
  const [isEditing, setIsEditing] = useState(false);

  // Date and list states
  const [journals, setJournals] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString("en-CA"));

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [tags, setTags] = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState("");
  const [activeEntryId, setActiveEntryId] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  // Server-side search fires per keystroke — debounce the value the request reads (#11)
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [moodFilter, setMoodFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Conflict states
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictDate, setConflictDate] = useState("");
  const [conflictSource, setConflictSource] = useState(""); // "new_entry" or "date_change"

  // Compute unique tags from all journals dynamically to populate tag filter dropdown
  const uniqueTags = [...new Set(journals.flatMap((j) => j.tags || []))];

  // Fetch all journals for history log
  const fetchJournals = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await cachedGet("/journal", {
        params: {
          search: debouncedSearchQuery,
          mood: moodFilter,
          tag: tagFilter,
          startDate,
          endDate
        }
      });
      if (res.data.success) {
        setJournals(res.data.journals);
      }
    } catch (err) {
      console.error("Error fetching journals:", err);
    } finally {
      setLoadingList(false);
    }
  }, [debouncedSearchQuery, moodFilter, tagFilter, startDate, endDate]);

  // Fetch journals on query change
  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  // Fetch journal entry when selectedDate changes
  useEffect(() => {
    const fetchEntryByDate = async () => {
      try {
        setErrorMsg("");
        setSuccessMsg("");
        const res = await cachedGet(`/journal/by-date/${selectedDate}`);
        if (res.data.success && res.data.journal) {
          const entry = res.data.journal;
          setTitle(entry.title || "");
          setContent(entry.content || "");
          setMood(entry.mood || "neutral");
          setTags(entry.tags || []);
          setActiveEntryId(entry._id);
        } else {
          setTitle("");
          setContent("");
          setMood("neutral");
          setTags([]);
          setActiveEntryId(null);
        }
      } catch (err) {
        console.error("Error fetching entry by date:", err);
        setErrorMsg("Failed to retrieve journal entry for the selected date.");
      }
    };
    fetchEntryByDate();
  }, [selectedDate]);

  // Fetch journal analytics when insights tab is active
  useEffect(() => {
    if (activeTab === "insights") {
      const fetchAnalytics = async () => {
        try {
          setLoadingAnalytics(true);
          const res = await cachedGet("/journal/analytics");
          if (res.data.success) {
            setAnalytics(res.data.analytics);
          }
        } catch (err) {
          console.error("Error fetching journal analytics:", err);
        } finally {
          setLoadingAnalytics(false);
        }
      };
      fetchAnalytics();
    }
  }, [activeTab]);

  // Save journal entry
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim()) {
      setErrorMsg("Please write some content before saving.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post("/journal", {
        date: selectedDate,
        title: title.trim(),
        content: content.trim(),
        mood,
        tags
      });

      if (res.data.success) {
        setSuccessMsg("Journal entry saved successfully!");
        setActiveEntryId(res.data.journal._id);
        
        // Once saved, exit edit mode (shows read-only view) and populate states with saved data
        setIsEditing(false);
        const savedJournal = res.data.journal;
        setTitle(savedJournal.title || "");
        setContent(savedJournal.content || "");
        setMood(savedJournal.mood || "neutral");
        setTags(savedJournal.tags || []);

        // Entry changed — drop cached journal/analytics reads so they refetch fresh
        invalidate("/journal");
        invalidate("/analytics");
        fetchJournals();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error saving journal entry:", err);
      setErrorMsg(err.response?.data?.message || "Failed to save journal entry.");
    } finally {
      setSaving(false);
    }
  };

  // Delete journal entry
  const handleDelete = async () => {
    if (!activeEntryId) return;
    if (!window.confirm("Are you sure you want to delete this journal entry?")) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      const res = await api.delete(`/journal/${activeEntryId}`);
      if (res.data.success) {
        setSuccessMsg("Journal entry deleted successfully.");
        setTitle("");
        setContent("");
        setMood("neutral");
        setTags([]);
        setActiveEntryId(null);
        setIsEditing(false);
        invalidate("/journal");
        invalidate("/analytics");
        fetchJournals();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting journal entry:", err);
      setErrorMsg("Failed to delete journal entry.");
    }
  };

  // Add a tag to the entry
  const handleAddTag = () => {
    const cleanTag = currentTagInput.trim().replace(/^#/, "");
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setCurrentTagInput("");
    }
  };

  // Remove tag from the entry
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Custom selector for history list clicks
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setIsEditing(false);
  };

  // Date picker handler inside form with conflict check
  const handleDateChange = (newDate) => {
    const existing = journals.find((j) => j.date === newDate);
    if (existing) {
      setConflictDate(newDate);
      setConflictSource("date_change");
      setShowConflictModal(true);
    } else {
      setSelectedDate(newDate);
    }
  };

  // Start new entry with conflict check
  const handleNewEntry = () => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const existing = journals.find((j) => j.date === todayStr);
    if (existing) {
      setConflictDate(todayStr);
      setConflictSource("new_entry");
      setShowConflictModal(true);
    } else {
      setSelectedDate(todayStr);
      setTitle("");
      setContent("");
      setMood("neutral");
      setTags([]);
      setActiveEntryId(null);
      setIsEditing(true); // Open the editor form immediately
      setActiveTab("workspace");
    }
  };

  // Handle Edit Existing option from conflict modal
  const handleEditExisting = async (date) => {
    setSelectedDate(date);
    try {
      const res = await cachedGet(`/journal/by-date/${date}`);
      if (res.data.success && res.data.journal) {
        const entry = res.data.journal;
        setTitle(entry.title || "");
        setContent(entry.content || "");
        setMood(entry.mood || "neutral");
        setTags(entry.tags || []);
        setActiveEntryId(entry._id);
      }
      setIsEditing(true);
    } catch (err) {
      console.error("Failed to load details for editing:", err);
    }
    setShowConflictModal(false);
  };

  // Handle View Existing option from conflict modal
  const handleViewExisting = (date) => {
    setSelectedDate(date);
    setIsEditing(false);
    setShowConflictModal(false);
  };

  // Handle Cancel/Change Date option from conflict modal
  const handleConflictCancel = () => {
    if (conflictSource === "new_entry") {
      const findFirstAvailableDate = () => {
        let d = new Date();
        const loggedDates = new Set(journals.map((j) => j.date));
        for (let i = 1; i <= 30; i++) {
          d.setDate(d.getDate() - 1);
          const dStr = d.toLocaleDateString("en-CA");
          if (!loggedDates.has(dStr)) {
            return dStr;
          }
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toLocaleDateString("en-CA");
      };
      
      const freeDate = findFirstAvailableDate();
      setSelectedDate(freeDate);
      setTitle("");
      setContent("");
      setMood("neutral");
      setTags([]);
      setActiveEntryId(null);
      setIsEditing(true);
      setActiveTab("workspace");
    }
    setShowConflictModal(false);
  };

  // Open editor with current loaded entry values
  const handleStartEdit = async () => {
    try {
      const res = await cachedGet(`/journal/by-date/${selectedDate}`);
      if (res.data.success && res.data.journal) {
        const entry = res.data.journal;
        setTitle(entry.title || "");
        setContent(entry.content || "");
        setMood(entry.mood || "neutral");
        setTags(entry.tags || []);
        setActiveEntryId(entry._id);
      }
      setIsEditing(true);
    } catch (err) {
      console.error("Failed to load details for editing:", err);
    }
  };

  // Reset filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setMoodFilter("");
    setTagFilter("");
    setStartDate("");
    setEndDate("");
  };

  // Render donut chart details
  const renderMoodDonut = () => {
    if (!analytics || !analytics.moodCounts) return null;
    const moodCounts = analytics.moodCounts;
    const totalMoods = Object.values(moodCounts).reduce((a, b) => a + b, 0);

    if (totalMoods === 0) {
      return (
        <div className="text-center py-8 text-muted italic text-xs">
          Not enough mood logs to display trend.
        </div>
      );
    }

    const moodColors = {
      happy: "#22c55e",
      calm: "#14b8a6",
      neutral: "#64748b",
      stressed: "#f97316",
      sad: "#3b82f6",
      energetic: "#eab308",
      tired: "#6366f1",
    };

    let cumulativePercentage = 0;
    const segments = Object.entries(moodCounts).map(([key, count]) => {
      const percentage = count / totalMoods;
      const strokeDash = percentage * 314.159;
      const strokeOffset = 314.159 - strokeDash + cumulativePercentage;
      cumulativePercentage -= strokeDash;
      return {
        key,
        count,
        percent: Math.round(percentage * 100),
        strokeDash,
        strokeOffset,
        color: moodColors[key] || "#94a3b8"
      };
    });

    return (
      <div className="flex flex-col md:flex-row justify-around items-center gap-6">
        <div className="space-y-2 text-left w-full md:w-auto">
          <h4 className="text-xs uppercase font-bold text-muted tracking-wider mb-2">Mood Shares</h4>
          {segments.filter(s => s.count > 0).map((seg) => (
            <div key={seg.key} className="flex items-center gap-2 text-xs font-semibold text-main">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }}></span>
              <span className="capitalize">{seg.key}:</span>
              <span>{seg.count} log(s)</span>
              <span className="text-muted">({seg.percent}%)</span>
            </div>
          ))}
        </div>
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            <circle cx="60" cy="60" r="50" fill="transparent" stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-slate-800" />
            {segments.filter(s => s.count > 0).map((seg) => (
              <circle
                key={seg.key}
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
            <span className="text-xl font-bold text-main">{totalMoods}</span>
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Logs</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto app-bg px-4 py-6 md:px-6 md:py-8 flex flex-col gap-6 animate-in">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-(--surface) p-4 rounded-xl shadow-sm border border-(--border) gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-800 transition cursor-pointer text-main"
            title="Go to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-primary" />
            <h1 className="text-xl md:text-2xl font-bold text-main">Daily Journal</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Tab Selector Buttons */}
          <div className="flex p-0.5 bg-slate-200/50 dark:bg-slate-800/80 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("workspace")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === "workspace"
                  ? "bg-white dark:bg-slate-900 text-main shadow-sm"
                  : "text-muted hover:text-main"
              }`}
            >
              Journal
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === "insights"
                  ? "bg-white dark:bg-slate-900 text-main shadow-sm"
                  : "text-muted hover:text-main"
              }`}
            >
              Insights
            </button>
          </div>

          <button
            onClick={handleNewEntry}
            className="btn btn-primary flex items-center justify-center gap-2 text-sm cursor-pointer shadow-sm hover-lift shrink-0"
          >
            <Plus size={16} />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Conditional Rendering based on Tab */}
      {activeTab === "workspace" ? (
        /* Workspace Tab (Grid layout) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: History & Search Filters */}
          <div className="card flex flex-col gap-4 lg:col-span-1 h-[730px] overflow-hidden">
            <div className="flex justify-between items-center border-b border-(--border) pb-2">
              <h2 className="text-lg font-semibold text-main flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <span>Journal History</span>
              </h2>
              <button
                onClick={handleClearFilters}
                className="text-[10px] text-primary font-bold hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>

            {/* Search Input (Fixed padding overlap issue) */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search entries or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
                className="w-full pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-(--border) rounded-xl text-sm focus:outline-none focus:border-primary text-main transition dark:placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-main"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Advanced Filters Drawer (Date Range & Dynamic Tags) */}
            <div className="grid grid-cols-1 gap-2 bg-slate-100/50 dark:bg-slate-800/30 p-3 rounded-xl border border-soft/30">
              <div className="flex items-center justify-between text-xs text-muted font-bold uppercase tracking-wider mb-0.5">
                <span>Advanced Filters</span>
              </div>
              
              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] text-muted font-semibold">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white/60 dark:bg-slate-800/60 border border-(--border) rounded-lg p-1.5 text-xs text-main focus:outline-none focus:border-primary w-full"
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] text-muted font-semibold">End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white/60 dark:bg-slate-800/60 border border-(--border) rounded-lg p-1.5 text-xs text-main focus:outline-none focus:border-primary w-full"
                  />
                </div>
              </div>

              {/* Tag Dropdown Filter */}
              <div className="flex flex-col gap-1 text-left mt-1">
                <span className="text-[10px] text-muted font-semibold">Filter by Tag</span>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="bg-white/60 dark:bg-slate-800/60 border border-(--border) rounded-lg p-1.5 text-xs text-main focus:outline-none focus:border-primary w-full"
                >
                  <option value="">All Tags</option>
                  {uniqueTags.map((t) => (
                    <option key={t} value={t}>
                      #{t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mood Filter Chips */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Mood Filter</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setMoodFilter("")}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    !moodFilter
                      ? "bg-primary/20 border-primary text-primary-hover font-bold"
                      : "bg-white/5 border-(--border) text-muted hover:text-main"
                  }`}
                >
                  All
                </button>
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMoodFilter(m.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                      moodFilter === m.value
                        ? `${m.color} border-primary font-bold shadow-[0_0_8px_rgba(78,183,179,0.3)]`
                        : "bg-white/5 border-(--border) text-muted hover:text-main"
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* History Cards Scroll List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingList ? (
                <div className="py-16 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : journals.length === 0 ? (
                <div className="text-center py-20 text-muted">
                  <p className="text-sm font-semibold">No entries matched</p>
                  <p className="text-xs mt-1">Try resetting dates, tags, or search parameters.</p>
                </div>
              ) : (
                journals.map((entry) => {
                  const entryMood = MOODS.find((m) => m.value === entry.mood) || MOODS[2];
                  const entryDate = new Date(entry.date + "T00:00:00");
                  const isSelected = selectedDate === entry.date;

                  return (
                    <div
                      key={entry._id}
                      onClick={() => handleSelectDate(entry.date)}
                      className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer select-none text-left relative overflow-hidden ${
                        isSelected
                          ? "bg-white dark:bg-slate-800 border-primary shadow-md translate-x-1"
                          : "bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-800 border-(--border) hover:shadow"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-xs text-muted font-bold tracking-wide">
                          {entryDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "2-digit"
                          })}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${entryMood.color}`}
                        >
                          <span>{entryMood.emoji}</span>
                          <span>{entryMood.label}</span>
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-main line-clamp-1 mb-1">
                        {entry.title || "Untitled Journal"}
                      </h3>

                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-medium rounded"
                            >
                              #{t}
                            </span>
                          ))}
                          {entry.tags.length > 3 && (
                            <span className="text-[9px] px-1 text-muted">+{entry.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Editor Workspace OR Read-only entry Viewer */}
          <div className="lg:col-span-2 min-h-[730px]">
            {isEditing ? (
              /* Editor Form Mode */
              <form onSubmit={handleSave} className="card flex flex-col gap-5 h-full justify-between text-left">
                {/* Header Date and backfill selector */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-(--border) pb-4">
                  <div>
                    <p className="text-xs text-muted font-bold uppercase tracking-wider">Journal</p>
                    <h2 className="text-xl font-bold text-main mt-0.5">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                  </div>

                  {/* Date backfilling selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted font-medium flex items-center gap-1">
                      <Calendar size={14} />
                      Change Date:
                    </span>
                    <input
                      type="date"
                      value={selectedDate}
                      max={new Date().toLocaleDateString("en-CA")}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="bg-white/40 dark:bg-slate-800/40 border border-(--border) rounded-lg px-2.5 py-1 text-xs text-main focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                {/* Error/Success Feedbacks */}
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm">
                    {successMsg}
                  </div>
                )}

                {/* Mood Selector (Flexbox Side-by-side display fix) */}
                <div className="space-y-2 text-left">
                  <label className="text-xs text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                    <Smile size={14} className="text-primary" />
                    How are you feeling today?
                  </label>
                  <div className="flex flex-wrap gap-2 w-full">
                    {MOODS.map((m) => {
                      const isSelected = mood === m.value;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMood(m.value)}
                          className={`flex-1 min-w-[72px] sm:min-w-[85px] flex flex-col items-center justify-center p-2.5 border rounded-xl cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? `${m.glow} bg-white dark:bg-slate-800 text-main`
                              : "bg-white/40 hover:bg-slate-100 dark:bg-slate-800/20 dark:hover:bg-slate-800/80 border-(--border) text-muted dark:text-slate-400 hover:text-main dark:hover:text-white hover:scale-102"
                          }`}
                        >
                          <span className="text-2xl mb-1 transition-transform duration-200 group-hover:scale-110">
                            {m.emoji}
                          </span>
                          <span className="text-[9px] font-semibold tracking-wide capitalize">{m.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title Input */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="journal-title" className="text-xs text-muted font-bold uppercase tracking-wider">
                    Title of the Day
                  </label>
                  <input
                    id="journal-title"
                    type="text"
                    placeholder="What best summarizes today?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/40 dark:bg-slate-800/40 border border-(--border) rounded-xl text-base focus:outline-none focus:border-primary text-main transition font-medium placeholder:text-muted/60 dark:placeholder-slate-500"
                  />
                </div>

                {/* Content TextArea */}
                <div className="flex-1 flex flex-col gap-1.5 min-h-[220px] text-left">
                  <label htmlFor="journal-content" className="text-xs text-muted font-bold uppercase tracking-wider">
                    Journal Entry
                  </label>
                  <textarea
                    id="journal-content"
                    placeholder="Write down your journal entry..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full flex-1 px-4 py-3 bg-white/40 dark:bg-slate-800/40 border border-(--border) rounded-xl text-sm focus:outline-none focus:border-primary text-main transition resize-none placeholder:text-muted/60 leading-relaxed dark:placeholder-slate-500"
                  />
                </div>

                {/* Tag Pills Manager */}
                <div className="space-y-2 text-left">
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 items-center p-3 bg-white/40 dark:bg-slate-800/40 border border-(--border) rounded-xl min-h-[46px]">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="p-0.5 rounded-full hover:bg-cyan-500/20 transition cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <div className="flex-1 min-w-[120px] flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a tag..."
                        value={currentTagInput}
                        onChange={(e) => setCurrentTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="bg-transparent text-xs text-main border-none focus:outline-none w-full dark:placeholder-slate-500"
                      />
                      {currentTagInput.trim() && (
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="text-xs text-primary font-bold cursor-pointer hover:underline"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex justify-between items-center border-t border-(--border) pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-white/10 dark:hover:bg-slate-800 border border-(--border) transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary px-5 py-2.5 flex items-center gap-2 text-sm cursor-pointer hover-lift font-semibold"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>Save Entry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : activeEntryId ? (
              /* Read-only Entry Viewer Mode */
              <div className="card flex flex-col gap-6 h-full justify-between text-left">
                <div>
                  {/* Viewer Header */}
                  <div className="flex justify-between items-start border-b border-(--border) pb-4 gap-2">
                    <div>
                      <p className="text-xs text-muted font-bold uppercase tracking-wider">Journal Entry</p>
                      <h2 className="text-xl font-bold text-main mt-0.5">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                    </div>

                    {/* Mood Display Badge */}
                    {(() => {
                      const entryMood = MOODS.find((m) => m.value === mood) || MOODS[2];
                      return (
                        <span
                          className={`text-xs px-3.5 py-1.5 rounded-full font-bold border flex items-center gap-1.5 shadow-sm ${entryMood.color}`}
                        >
                          <span className="text-base">{entryMood.emoji}</span>
                          <span className="capitalize">{entryMood.label}</span>
                        </span>
                      );
                    })()}
                  </div>

                  {/* Reflection Content Body */}
                  <div className="space-y-4 py-4">
                    {title && (
                      <h3 className="text-lg font-bold text-main border-l-4 border-primary pl-3">
                        {title}
                      </h3>
                    )}
                    
                    <p className="text-sm text-main/90 dark:text-white/90 leading-relaxed whitespace-pre-wrap py-2 font-medium bg-slate-50/40 dark:bg-slate-800/10 p-4 rounded-xl border border-soft/10">
                      {content}
                    </p>

                    {tags.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Tagged Topics</span>
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Action Footer */}
                <div className="flex justify-between items-center border-t border-(--border) pt-4">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-red-500/20 active:scale-95 transition cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    <span>Delete Entry</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="group flex gap-2 justify-center items-center px-4 py-2.5 rounded-xl bg-(--primary) text-white text-xs font-bold hover:opacity-85 active:scale-95 transition-all duration-150 cursor-pointer shadow-sm hover-lift"
                  >
                    <Edit2 size={13} />
                    <span>Edit Entry</span>
                  </button>
                </div>
              </div>
            ) : (
              /* No Entry Placeholder Mode */
              <div className="card flex flex-col items-center justify-center text-center p-8 gap-4 h-full border-dashed border-2">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted border border-soft">
                  <BookOpen size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-main">No Entry Written Yet</h3>
                  <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                    Logging your daily journal can help track progress, log metrics, and establish strong consistency. Write your journal entry now!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary flex items-center gap-2 text-xs font-bold cursor-pointer hover-lift shadow-sm mt-2"
                >
                  <Plus size={14} />
                  <span>Create Journal Entry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Insights Tab */
        <div className="flex flex-col gap-6 text-left">
          {loadingAnalytics ? (
            <div className="py-24 card flex flex-col items-center justify-center">
              <LoadingSpinner />
              <p className="text-xs text-muted mt-3">Synthesizing journal history insights...</p>
            </div>
          ) : !analytics ? (
            <div className="py-20 card text-center text-muted">
              <p className="text-sm">Failed to load journal insights.</p>
              <p className="text-xs mt-1">Make sure you have logged some entries first.</p>
            </div>
          ) : (
            <>
              {/* Totals & Streak Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                
                <div className="card flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:shadow-md border-l-4 border-l-blue-500 hover:scale-[1.01] transition-all duration-300">
                  <div className="p-3 bg-blue-500/10 text-blue-500 dark:text-slate-200 rounded-xl">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Entries</p>
                    <h3 className="text-2xl font-bold text-main">{analytics.totalEntries}</h3>
                    <p className="text-[10px] text-muted/70">Personal records logged</p>
                  </div>
                </div>

                <div className="card flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:shadow-md border-l-4 border-l-amber-500 hover:scale-[1.01] transition-all duration-300">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Flame size={24} className="fill-amber-500/10" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Current Streak</p>
                    <h3 className="text-2xl font-bold text-main">{analytics.currentStreak} Days</h3>
                    <p className="text-[10px] text-muted/70">Consecutive logging days</p>
                  </div>
                </div>

                <div className="card flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:shadow-md border-l-4 border-l-purple-500 hover:scale-[1.01] transition-all duration-300">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Best Streak Record</p>
                    <h3 className="text-2xl font-bold text-main">{analytics.bestStreak} Days</h3>
                    <p className="text-[10px] text-muted/70">All-time record streak</p>
                  </div>
                </div>

              </div>

              {/* Middle Row: Monthly Bar Chart & Dynamic Tags cloud */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                
                {/* Monthly Activity */}
                <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-main mb-4 flex items-center gap-2 border-b border-(--border) pb-2">
                    <BarChart2 size={16} className="text-blue-500" />
                    <span>Monthly Journaling Activity (Last 6 Months)</span>
                  </h3>
                  
                  <div className="w-full flex justify-center py-2">
                    {analytics.monthlyActivity.reduce((sum, item) => sum + item.count, 0) === 0 ? (
                      <div className="text-center py-16 text-muted text-xs italic">
                        No entries recorded in the last 6 months.
                      </div>
                    ) : (
                      <svg viewBox="0 0 350 180" className="w-full max-w-[420px]">
                        {/* Horizontal Grid lines */}
                        {[-0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                          const maxVal = Math.max(...analytics.monthlyActivity.map(m => m.count, 1));
                          const y = 140 - p * 110;
                          return (
                            <g key={idx}>
                              <line x1="30" y1={y} x2="330" y2={y} stroke="#e2e8f0" strokeDasharray="4" strokeWidth="0.5" className="dark:stroke-slate-800" />
                              <text x="5" y={y + 3} fontSize="8" className="fill-slate-400 font-medium">
                                {Math.round(p * maxVal)}
                              </text>
                            </g>
                          );
                        })}

                        {/* Draw Bars */}
                        {analytics.monthlyActivity.map((month, idx) => {
                          const maxVal = Math.max(...analytics.monthlyActivity.map(m => m.count), 1);
                          const spacing = 48;
                          const baseX = 38 + idx * spacing;
                          const barHeight = (month.count / maxVal) * 110;
                          const barY = 140 - barHeight;

                          return (
                            <g key={idx}>
                              <rect
                                x={baseX}
                                y={barY}
                                width="18"
                                height={barHeight}
                                fill="#4eb7b3"
                                className="transition-all duration-300 hover:fill-[#3b8ea0]"
                                rx="3"
                              />
                              <text x={baseX + 9} y="153" textAnchor="middle" fontSize="8" className="fill-slate-500 font-semibold dark:fill-slate-400">
                                {month.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </div>
                </div>

                {/* Popular Tags Card */}
                <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-main mb-4 flex items-center gap-2 border-b border-(--border) pb-2">
                      <Tag size={16} className="text-cyan-500" />
                      <span>Most Common Journal Tags</span>
                    </h3>
                    
                    {analytics.popularTags.length === 0 ? (
                      <div className="text-center py-16 text-muted text-xs italic">
                        Add tags (like #productivity, #rest) to your entries to visualize tag clouds.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3 p-4 justify-center items-center">
                        {analytics.popularTags.map((tag, idx) => {
                          const sizes = ["text-base", "text-sm", "text-xs", "text-[11px]", "text-[10px]"];
                          const sizeClass = sizes[idx] || "text-xs";
                          return (
                            <span
                              key={tag.name}
                              className={`px-3 py-1.5 rounded-full font-bold bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 shadow-sm flex items-center gap-1.5 ${sizeClass}`}
                            >
                              <span>#{tag.name}</span>
                              <span className="text-[10px] bg-cyan-500/20 text-[#3b8ea0] px-1.5 py-0.5 rounded-full font-bold">
                                {tag.count}x
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted italic text-center">
                    Visualizes topics you mention and log most frequently in your journal.
                  </p>
                </div>

              </div>

              {/* Mood Trends Donut Chart */}
              <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <h3 className="text-sm font-bold text-main mb-4 flex items-center gap-2 border-b border-(--border) pb-2">
                  <TrendingUp size={16} className="text-teal-500" />
                  <span>Mood Breakdown & Trends</span>
                </h3>
                {renderMoodDonut()}
              </div>
            </>
          )}
        </div>
      )}

      {/* Entry Conflict Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-main">Journal Entry Already Exists</h3>
              <p className="text-sm text-muted">
                A journal entry has already been written for <span className="font-semibold text-main">{new Date(conflictDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>.
              </p>
              <p className="text-xs text-muted/85 leading-relaxed">
                Would you like to edit the existing journal entry, view it, or choose a different date for a new entry?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => handleEditExisting(conflictDate)}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-(--primary) text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Edit2 size={13} />
                <span>Edit Existing</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleViewExisting(conflictDate)}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-main border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <BookOpen size={13} />
                <span>View Entry</span>
              </button>

              <button
                type="button"
                onClick={handleConflictCancel}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl text-muted hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
              >
                {conflictSource === "new_entry" ? "Change Date" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
