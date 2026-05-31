import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, CheckCircle2, 
  Settings, Music, Moon, AlertCircle, RefreshCw, Layers 
} from "lucide-react";
import api from "../api/axios";

// Available copyright-free ambient soundscapes
const SOUNDSCAPES = [
  { id: "none", name: "Silence", url: "" },
  { id: "lofi", name: "Lofi Study Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "rain", name: "Summer Rain", url: "https://www.soundjay.com/nature/sounds/rain-07.mp3" },
  { id: "river", name: "Forest Stream", url: "https://www.soundjay.com/nature/sounds/river-1.mp3" }
];

export default function ForgeMode() {
  const navigate = useNavigate();
  
  // Timer settings & states
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [timerMode, setTimerMode] = useState(25); // Default 25 minutes
  
  // Task selection & auto-loading
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [customTaskTitle, setCustomTaskTitle] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [routineTaskLoaded, setRoutineTaskLoaded] = useState(null);
  
  // Ambient audio state
  const [currentSound, setCurrentSound] = useState("none");
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [soundscapeMenuOpen, setSoundscapeMenuOpen] = useState(false);
  
  // Canvas particle state
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const particles = useRef([]);
  
  // Audio reference
  const audioRef = useRef(null);
  
  // Fetch routines and tasks on mount to auto-load active task
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch user tasks library
        const tasksRes = await api.get("/tasks");
        const fetchedTasks = tasksRes.data.tasks || [];
        setTasks(fetchedTasks);

        // Fetch routines to search for currently active routine task
        const routinesRes = await api.get("/routines");
        const fetchedRoutines = routinesRes.data.routines || [];
        
        // Auto-load scheduled task if active routine exists
        const activeIds = JSON.parse(localStorage.getItem("activeRoutineIds") || "[]");
        if (activeIds.length > 0 && fetchedRoutines.length > 0) {
          const activeRoutines = fetchedRoutines.filter(r => activeIds.includes(r._id));
          
          // Get current weekday and time
          const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDayName = weekdays[new Date().getDay()];
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          
          // Find if there is a routine item scheduled right now
          let matchedItem = null;
          let matchedRoutine = null;
          
          for (const routine of activeRoutines) {
            const item = routine.items.find(it => {
              const start = it.startTime;
              const end = it.startTime + it.duration;
              return it.day === currentDayName && currentMinutes >= start && currentMinutes < end;
            });
            if (item) {
              matchedItem = item;
              matchedRoutine = routine;
              break;
            }
          }
          
          if (matchedItem) {
            // Find task info in task library
            const taskInfo = fetchedTasks.find(t => t._id === matchedItem.taskId);
            const loadedTask = {
              _id: matchedItem.taskId,
              title: taskInfo?.title || "Scheduled Routine Task",
              tags: taskInfo?.tags || ["Routine"],
              priority: taskInfo?.priority || "Medium",
              isFromRoutine: true,
              duration: matchedItem.duration,
              routineId: matchedRoutine._id
            };
            setSelectedTask(loadedTask);
            setRoutineTaskLoaded(loadedTask);
            // Pre-fill timer to match scheduled duration if desired (e.g. capped to 50 mins or set explicitly)
            const scheduledSec = Math.min(matchedItem.duration * 60, 90 * 60);
            setTotalSeconds(scheduledSec);
            setSecondsLeft(scheduledSec);
          }
        }
      } catch (err) {
        console.error("Failed to load Forge Mode initial data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  const handleTimerCompleteRef = useRef(null);

  // Timer interval effect
  useEffect(() => {
    let intervalId = null;
    if (isRunning && secondsLeft > 0) {
      intervalId = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      if (handleTimerCompleteRef.current) handleTimerCompleteRef.current();
    }
    return () => clearInterval(intervalId);
  }, [isRunning, secondsLeft]);

  // Audio stream controller
  useEffect(() => {
    // Cleanup any existing audio instance
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const soundObj = SOUNDSCAPES.find(s => s.id === currentSound);
    if (soundObj && soundObj.url) {
      const audio = new Audio(soundObj.url);
      audio.loop = true;
      audioRef.current = audio;
    }
  }, [currentSound]);

  // Sync audio with play/pause of the Pomodoro timer
  useEffect(() => {
    if (audioRef.current) {
      if (isRunning && !sessionCompleted) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isRunning, sessionCompleted, currentSound]);

  // Sync volume adjustments
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, currentSound]);

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // SVG circular circumference configurations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((secondsLeft / totalSeconds) * circumference);

  // Dynamic Spot Glow Color based on active task tag
  const getGlowColorClass = () => {
    if (!selectedTask) return "from-emerald-500/10 via-transparent to-transparent";
    const tag = (selectedTask.tags && selectedTask.tags[0]) || "";
    const priority = selectedTask.priority || "Medium";
    
    if (priority === "High") return "from-rose-500/15 via-transparent to-transparent";
    
    switch (tag.toLowerCase()) {
      case "homework":
        return "from-blue-500/15 via-transparent to-transparent";
      case "creative":
        return "from-purple-500/15 via-transparent to-transparent";
      case "routine":
        return "from-emerald-500/15 via-transparent to-transparent";
      default:
        return "from-teal-500/12 via-transparent to-transparent";
    }
  };

  // Timer complete triggers
  const handleTimerComplete = async () => {
    setIsRunning(false);
    setSessionCompleted(true);
    triggerSparks();
    
    // Play completion chime
    try {
      const chime = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-200.wav");
      chime.volume = volume;
      chime.play();
    } catch (e) {
      console.log("Failed to play completion chime:", e);
    }

    // Write to database to log task execution analytics
    if (selectedTask) {
      const elapsedMinutes = Math.round((totalSeconds - secondsLeft) / 60) || 1;
      
      try {
        if (selectedTask.isFromRoutine || !selectedTask._id) {
          // If a routine placeholder or custom string task completed, create new task doc in db
          await api.post("/tasks", {
            title: selectedTask.title,
            description: `Session completed in Forge Mode`,
            priority: selectedTask.priority || "Medium",
            status: "Completed",
            dueDate: new Date().toISOString(),
            tags: selectedTask.tags || ["Routine"],
          });
        } else {
          // Update existing library task status to Completed
          await api.put(`/tasks/${selectedTask._id}`, {
            status: "Completed",
            actualDuration: elapsedMinutes
          });
        }
      } catch (err) {
        console.error("Failed to log focus task success to MERN backend:", err);
      }
    }
  };

  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  });

  // Start Confetti Particles
  const triggerSparks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    particles.current = [];
    
    // Create 100 gold particle sparks
    for (let i = 0; i < 150; i++) {
      particles.current.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 40,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.6) * 16 - 3,
        radius: Math.random() * 4 + 1.5,
        color: `hsla(${Math.random() * 20 + 38}, 100%, ${Math.random() * 30 + 55}%, ${Math.random() * 0.7 + 0.3})`,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008
      });
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.current.forEach(p => {
        if (p.alpha > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.28; // gravity
          p.vx *= 0.98; // drag
          p.alpha -= p.decay;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.fill();
        }
      });

      if (alive) {
        animationFrameId.current = requestAnimationFrame(animateParticles);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animateParticles();
  };

  // Stop current animations on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const changeTimerMode = (mins) => {
    setTimerMode(mins);
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
    setIsRunning(false);
    setSessionCompleted(false);
  };

  const handleCustomTaskAdd = () => {
    if (!customTaskTitle.trim()) return;
    const newTask = {
      title: customTaskTitle.trim(),
      priority: "Medium",
      tags: ["Focus"],
      status: "Due"
    };
    setSelectedTask(newTask);
    setCustomTaskTitle("");
    setIsSelectorOpen(false);
    setSessionCompleted(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#070b19] text-[#f8fafc] flex flex-col justify-between overflow-hidden relative select-none font-sans z-40">
      {/* Background radial spotlights */}
      <div className={`absolute inset-0 bg-radial ${getGlowColorClass()} transition-all duration-1000 pointer-events-none z-0`} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Confetti canvas overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30" />

      {/* Top Bar Navigation */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-white/5 bg-slate-950/20 backdrop-blur-md z-20">
        <button 
          onClick={() => {
            if (audioRef.current) audioRef.current.pause();
            navigate("/dashboard");
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-white/5 rounded-full px-4 py-1.5 shadow-inner">
          <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-orange-500'} shadow-sm`} />
          <span className="text-xs font-medium tracking-wide text-slate-400">
            {isRunning ? 'Deep Focus Session Active' : 'Forge Mode Ready'}
          </span>
        </div>

        <button
          onClick={() => setIsSelectorOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#4eb7b3] hover:bg-[#6dd5c7] text-slate-950 transition-all font-semibold text-xs uppercase tracking-wider cursor-pointer"
        >
          <Layers size={14} />
          Change Task
        </button>
      </header>

      {/* Center Main Countdown Timer */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 px-4 z-10">
        
        {/* Dynamic Task card heading */}
        <div className="text-center max-w-lg mb-8 transition-all duration-300">
          <p className="text-xs uppercase font-bold tracking-widest text-[#4eb7b3] mb-2">Active Task</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 leading-snug drop-shadow-md">
            {selectedTask?.title || "Choose a task to start..."}
          </h2>
          
          {selectedTask && (
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {selectedTask.tags?.map((t, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#98e1d7]/10 text-[#98e1d7] border border-[#98e1d7]/20 uppercase tracking-wider">
                  {t}
                </span>
              ))}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                selectedTask.priority === "High" 
                  ? "bg-red-500/10 text-red-400 border-red-500/20" 
                  : selectedTask.priority === "Medium"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-slate-500/10 text-slate-400 border-slate-500/20"
              }`}>
                {selectedTask.priority || "Medium"} Priority
              </span>
            </div>
          )}
        </div>

        {/* SVG Pomodoro circular countdown */}
        <div className="relative flex items-center justify-center mb-8">
          <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 drop-shadow-2xl">
            {/* Background ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="stroke-[#131d35] stroke-[8px] fill-transparent"
            />
            {/* Dynamic glowing countdown ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className={`stroke-[8px] fill-transparent transition-all duration-300 ${
                sessionCompleted ? 'stroke-yellow-400' : 'stroke-[#4eb7b3]'
              }`}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits centered */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            {sessionCompleted ? (
              <div className="animate-bounce">
                <CheckCircle2 size={54} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              </div>
            ) : (
              <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-white select-all">
                {formatTime(secondsLeft)}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">
              {sessionCompleted ? 'Splendid Job!' : `${timerMode}m interval`}
            </span>
          </div>
        </div>

        {/* Minimalist circular Controls Panel */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-white/5 rounded-2xl px-6 py-4 shadow-xl backdrop-blur-md">
          <button
            onClick={() => {
              setSecondsLeft(totalSeconds);
              setIsRunning(false);
              setSessionCompleted(false);
            }}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Reset Timer"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={sessionCompleted}
            className={`p-5 rounded-2xl text-slate-950 font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isRunning ? 'bg-[#ff9482] hover:bg-[#ffb4a8] shadow-orange-500/10' : 'bg-[#4eb7b3] hover:bg-[#6dd5c7] shadow-teal-500/10'
            }`}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>

          <button
            onClick={handleTimerComplete}
            disabled={sessionCompleted}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Complete Early"
          >
            <CheckCircle2 size={18} />
          </button>
        </div>

        {/* Short break & Interval standard toggles */}
        <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
          {[15, 25, 50].map((mins) => (
            <button
              key={mins}
              onClick={() => changeTimerMode(mins)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                timerMode === mins 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'bg-transparent text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-300'
              }`}
            >
              {mins}m Focus
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Panel Drawer - Ambient Sounds controls */}
      <footer className="w-full px-6 py-4 flex flex-col md:flex-row items-center justify-between border-t border-white/5 bg-slate-950/40 backdrop-blur-md gap-4 z-20">
        
        {/* Sound Selection Button & popup */}
        <div className="relative">
          <button
            onClick={() => setSoundscapeMenuOpen(!soundscapeMenuOpen)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer select-none"
          >
            <Music size={15} className="text-[#4eb7b3]" />
            <span>Soundscape: {SOUNDSCAPES.find(s => s.id === currentSound)?.name}</span>
          </button>

          {soundscapeMenuOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-48 bg-[#0d152c] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-200">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-3 py-1.5">Ambient Audio</div>
              {SOUNDSCAPES.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => {
                    setCurrentSound(sound.id);
                    setSoundscapeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    currentSound === sound.id 
                      ? 'bg-[#4eb7b3]/20 text-[#4eb7b3] font-semibold' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {sound.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume controls */}
        {currentSound !== "none" && (
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="w-24 accent-[#4eb7b3] h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-400 w-6 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        )}

        {/* Exit Hint */}
        <p className="text-[10px] text-slate-500 tracking-wider font-medium">
          PRO-TIP: Turn off notifications to promote deep flow states.
        </p>
      </footer>

      {/* Task Selector overlay modal drawer */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in duration-200">
          <div className="w-full max-w-md bg-[#0b1022] border border-white/10 rounded-2xl shadow-2xl p-6 relative">
            
            <h3 className="text-lg font-bold text-white mb-1">Select Active Task</h3>
            <p className="text-xs text-slate-400 mb-5">Select a task from your scheduled active routines or your library to execute.</p>
            
            {/* Scheduled Routine Task status */}
            {routineTaskLoaded ? (
              <div className="mb-6 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Scheduled in Active Routine
                </div>
                <div className="flex items-center justify-between">
                  <div className="truncate pr-4">
                    <div className="text-sm font-semibold text-white truncate">{routineTaskLoaded.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{routineTaskLoaded.duration} min scheduled today</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTask(routineTaskLoaded);
                      setTotalSeconds(Math.min(routineTaskLoaded.duration * 60, 90 * 60));
                      setSecondsLeft(Math.min(routineTaskLoaded.duration * 60, 90 * 60));
                      setIsSelectorOpen(false);
                      setSessionCompleted(false);
                    }}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors cursor-pointer"
                  >
                    Load Task
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-2xl border border-white/5 bg-white/2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Routine Status</div>
                <p className="text-xs text-slate-400">No active routine task scheduled for this hour. Select one below or input custom focus.</p>
              </div>
            )}

            {/* Custom Task Entry */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Create Custom Focus</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={50}
                  placeholder="What are you working on?"
                  value={customTaskTitle}
                  onChange={(e) => setCustomTaskTitle(e.target.value)}
                  className="flex-1 p-3 rounded-xl border border-white/10 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4eb7b3]/60 transition-colors"
                />
                <button
                  onClick={handleCustomTaskAdd}
                  className="px-4 rounded-xl bg-[#4eb7b3] hover:bg-[#6dd5c7] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Lock In
                </button>
              </div>
            </div>

            {/* Library Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Or Select From Library</label>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {isLoading ? (
                  <p className="text-xs text-slate-500 italic py-2">Loading library...</p>
                ) : tasks.filter(t => t.status !== "Completed").length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No due tasks in your library.</p>
                ) : (
                  tasks.filter(t => t.status !== "Completed").map(task => (
                    <button
                      key={task._id}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsSelectorOpen(false);
                        setSessionCompleted(false);
                      }}
                      className="w-full text-left p-3 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <span className="font-medium truncate group-hover:translate-x-0.5 transition-transform">{task.title}</span>
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-950 rounded-md border border-white/5">
                        {task.priority}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsSelectorOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              &times;
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
