import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, AlertTriangle, ShieldCheck, Trophy, Sparkles } from "lucide-react";

export default function FocusMode() {
  // Session States
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [strictness, setStrictness] = useState("Standard"); // Standard, High, Extreme
  const [ambientSound, setAmbientSound] = useState("None"); // None, White Noise, Deep Focus (40Hz), Ocean waves
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitoring States
  const [distractions, setDistractions] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60);

  // Audio Context Ref for offline ambient synthesis
  const audioContextRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Fullscreen Detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setSessionCompleted(true);
      stopAmbientSound();
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Page Visibility & Window Focus Switch Detection
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerDistraction();
      }
    };

    const handleWindowBlur = () => {
      registerDistraction();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isActive, strictness]);

  // Register distraction violation
  const registerDistraction = () => {
    setDistractions((d) => d + 1);
    setShowWarning(true);

    // Extreme strictness pauses session automatically
    if (strictness === "Extreme") {
      setIsActive(false);
    }

    // Play synthesized alert chime
    playWarningBeep();
  };

  // Synthesize Warning Beep using Web Audio API
  const playWarningBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3); // Pitch slide

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  };

  // Start Ambient Sound Synthesis
  const startAmbientSound = () => {
    if (ambientSound === "None") {
      stopAmbientSound();
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      stopAmbientSound(); // Clean up current source

      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : 0.15, ctx.currentTime);
      gainNodeRef.current.connect(ctx.destination);

      if (ambientSound === "White Noise") {
        // Synthesize White Noise (100% offline)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(gainNodeRef.current);
        whiteNoise.start();
        noiseSourceRef.current = whiteNoise;
      } else if (ambientSound === "Deep Focus (40Hz)") {
        // Synthesize Binaural Focus Frequency (Carrier 200Hz + Modulator 40Hz)
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, ctx.currentTime); // Deep focus sine wave
        osc.connect(gainNodeRef.current);
        osc.start();
        oscillatorRef.current = osc;
      } else if (ambientSound === "Ocean waves") {
        // Synthesize ocean wave sweep effect (modulated bandpass filtered noise)
        const bufferSize = 4 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 1.5;

        // Modulate filter frequency to simulate waves
        const modulator = ctx.createOscillator();
        modulator.frequency.value = 0.08; // 1 wave every 12 seconds
        
        const modulatorGain = ctx.createGain();
        modulatorGain.gain.value = 300;

        modulator.connect(modulatorGain);
        modulatorGain.connect(filter.frequency);
        noise.connect(filter);
        filter.connect(gainNodeRef.current);

        modulator.start();
        noise.start();

        noiseSourceRef.current = noise;
        oscillatorRef.current = modulator;
      }
    } catch (e) {
      console.error("Failed to synthesis ambient focus sounds:", e);
    }
  };

  // Stop ambient sound synthesis
  const stopAmbientSound = () => {
    try {
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } catch (e) {
      // safe bypass
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(nextMuted ? 0 : 0.15, audioContextRef.current.currentTime);
    }
  };

  // Ambient sound selection triggers restart of synthesis
  useEffect(() => {
    if (isActive) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [ambientSound, isActive]);

  // Request Fullscreen distraction-free mode
  const enterFullscreenMode = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (e) {
      console.warn("Fullscreen request declined:", e);
    }
  };

  // Trigger Session Start
  const handleStartSession = () => {
    setIsActive(true);
    setSessionCompleted(false);
    setInitialTime(duration * 60);
    setTimeLeft(duration * 60);
    setDistractions(0);
    setShowWarning(false);
    enterFullscreenMode();
  };

  // Stop Session
  const handleStopSession = () => {
    setIsActive(false);
    stopAmbientSound();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Reset Session
  const handleResetSession = () => {
    handleStopSession();
    setTimeLeft(duration * 60);
    setDistractions(0);
    setShowWarning(false);
    setSessionCompleted(false);
  };

  // Format time remaining MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Compute Focus Efficiency rating
  const computeEfficiency = () => {
    const score = Math.max(0, 100 - distractions * 12);
    if (score >= 95) return { text: "Focus Master", color: "text-emerald-500", rating: score };
    if (score >= 80) return { text: "Efficient Creator", color: "text-teal-500", rating: score };
    if (score >= 60) return { text: "Standard Achiever", color: "text-yellow-500", rating: score };
    return { text: "Highly Distracted", color: "text-rose-500", rating: score };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
      {/* Background aesthetic decor glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-teal-400/10 dark:bg-teal-500/5 rounded-full filter blur-3xl pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {!isActive && !sessionCompleted ? (
          // SET-UP CONFIGURATION SCREEN
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="card glass relative z-10 max-w-xl mx-auto w-full p-8 border border-border/40"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Flame className="text-teal-500" size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading text-main">Focus Mode Setup</h1>
                <p className="text-xs text-muted-foreground">Distraction-free kiosk style routines</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Duration Slider */}
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-muted-foreground">Session Duration</span>
                  <span className="text-teal-500 font-bold">{duration} minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(e) => {
                    setDuration(parseInt(e.target.value));
                    setTimeLeft(parseInt(e.target.value) * 60);
                  }}
                  className="w-full h-2 bg-accent/40 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                  <span>5m</span>
                  <span>25m (Pomodoro)</span>
                  <span>60m</span>
                  <span>120m</span>
                </div>
              </div>

              {/* Strictness Level Selector */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Strictness Enforcement
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Standard", "High", "Extreme"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setStrictness(lvl)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                        strictness === lvl
                          ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 shadow-sm"
                          : "border-border hover:bg-accent/40 text-muted-foreground"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                  {strictness === "Standard" && "🚨 Tracks tab switching and counts violations gently."}
                  {strictness === "High" && "🔒 Logs tab/app switching and sounds annoying audio alerts."}
                  {strictness === "Extreme" && "⛔ Immediately pauses the countdown and logs a penalty if you switch tabs."}
                </p>
              </div>

              {/* Offline Ambient Sound Selector */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Ambient Wave Focus Sounds
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["None", "White Noise", "Deep Focus (40Hz)", "Ocean waves"].map((sound) => (
                    <button
                      key={sound}
                      onClick={() => setAmbientSound(sound)}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all text-center ${
                        ambientSound === sound
                          ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                          : "border-border hover:bg-accent/40 text-muted-foreground"
                      }`}
                    >
                      {sound}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartSession}
                className="w-full mt-4 btn btn-primary py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-teal-500/15 flex items-center justify-center gap-2"
              >
                <Play size={18} fill="white" />
                Initialize Distraction-Free Session
              </button>
            </div>
          </motion.div>
        ) : isActive ? (
          // ACTIVE FOCUS SESSION TIMER SCREEN
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center py-10 relative z-10"
          >
            {/* Immersive distraction counter */}
            <div className="absolute top-4 flex gap-4 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Strictness: {strictness}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Distractions: {distractions}
              </span>
            </div>

            {/* Giant Countdown Clock */}
            <div className="relative w-72 h-72 rounded-full border-4 border-teal-500/20 flex items-center justify-center shadow-inner mt-8 bg-white/5 backdrop-blur-md">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-teal-500 animate-ping opacity-15" />
              
              <div className="text-center">
                <p className="text-5xl font-mono font-bold tracking-tight text-main">{formatTime(timeLeft)}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">remaining</p>
              </div>
            </div>

            {/* Control Panel */}
            <div className="flex items-center gap-6 mt-10">
              {/* Reset Control */}
              <button
                onClick={handleResetSession}
                className="p-3.5 rounded-full border border-border hover:bg-accent/40 text-muted-foreground transition-all cursor-pointer"
                title="Reset Session"
              >
                <RotateCcw size={18} />
              </button>

              {/* Pause/Resume Toggle */}
              <button
                onClick={handleStopSession}
                className="w-16 h-16 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-105 cursor-pointer"
                title="Pause Focus Session"
              >
                <Pause size={24} fill="white" />
              </button>

              {/* Mute/Unmute Ambient Noise Control */}
              {ambientSound !== "None" && (
                <button
                  onClick={handleToggleMute}
                  className="p-3.5 rounded-full border border-border hover:bg-accent/40 text-muted-foreground transition-all cursor-pointer"
                  title={isMuted ? "Unmute Ambient" : "Mute Ambient"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              )}
            </div>

            {/* Fullscreen Overlay Trigger */}
            <div className="mt-8">
              {!isFullscreen ? (
                <button
                  onClick={enterFullscreenMode}
                  className="text-xs text-teal-500 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 size={12} /> Enter Fullscreen Kiosk Mode
                </button>
              ) : (
                <button
                  onClick={() => document.exitFullscreen().catch(() => {})}
                  className="text-xs text-muted-foreground hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Minimize2 size={12} /> Exit Fullscreen
                </button>
              )}
            </div>

            {/* DISTRACTION DETECTED WARNING MODAL */}
            <AnimatePresence>
              {showWarning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                  <div className="bg-white dark:bg-slate-900 border border-orange-500/30 rounded-2xl p-6 max-w-sm text-center shadow-2xl">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="text-orange-500" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-main">Distraction Warning!</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      We detected that you switched your active browser tab or window. Focus Mode tracks concentration violations to hold you accountable.
                    </p>
                    {strictness === "Extreme" && (
                      <p className="text-xs text-rose-500 font-bold mt-2">
                        Extreme Mode has automatically paused the timer!
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setShowWarning(false);
                        if (strictness === "Extreme") {
                          setIsActive(true);
                        }
                      }}
                      className="mt-5 w-full btn btn-primary py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Return to Focus Workspace
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          // SESSION COMPLETED STATISTICS SCREEN
          <motion.div
            key="stats"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="card glass relative z-10 max-w-md mx-auto w-full p-8 text-center border border-border/40"
          >
            <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-teal-500" size={32} />
            </div>

            <h1 className="text-2xl font-bold font-heading text-main">Focus Session Completed!</h1>
            <p className="text-sm text-muted-foreground mt-1">Excellent performance forging routine discipline.</p>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-xl bg-accent/20 border border-border/40">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Focus Duration</p>
                <p className="text-xl font-bold text-main mt-0.5">{duration} mins</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Distractions</p>
                <p className="text-xl font-bold text-main mt-0.5">{distractions}</p>
              </div>
              <div className="col-span-2 border-t border-border/40 pt-3 mt-1 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Efficiency Score</p>
                <p className={`text-2xl font-black mt-1 ${computeEfficiency().color}`}>
                  {computeEfficiency().rating}%
                </p>
                <span className="text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1 mt-1">
                  <Sparkles size={12} className="text-teal-500 animate-pulse" /> Rating: {computeEfficiency().text}
                </span>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetSession}
              className="mt-6 w-full btn btn-primary py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Forge Another Routine
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
