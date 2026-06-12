import React, { useEffect, useRef, useState } from 'react';
import Particles from "../react-ui/Particles";
import finSound from "../assets/sounds/fin.mp3";

const Pomodoro = () => {
  const [showPopUp, setShowPopUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const finRef = useRef(new Audio(finSound));

  const stopCompletionSound = () => {
    if (finRef.current) {
      finRef.current.pause();
      finRef.current.currentTime = 0;
      finRef.current.loop = false;
    }
  };

  useEffect(() => {
    return () => stopCompletionSound();
  }, []);

  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimeLeft(25 * 60);
            setIsRunning(false);
            finRef.current.play().catch((err) => console.error("Audio playback failed:", err));
            setShowPopUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full min-h-[600px] flex flex-col items-center justify-center overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Particles
          particleColors={["#3b8ea0"]}
          particleCount={120}
          particleSpread={12}
          speed={0.08}
          particleBaseSize={80}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-4 py-12 max-w-xl mx-auto w-full text-center">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Complete your tasks with a pomodoro timer
        </h1>

        <div className="w-[280px] h-[280px] rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center transition-colors duration-300 transform hover:scale-102">
          <h1 className="text-6xl font-black text-[#3b8ea0] dark:text-[#4eb7b3] font-mono tracking-tighter">
            {formatTime()}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <button
            onClick={() => setIsRunning(true)}
            className="px-6 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Start
          </button>

          <button
            onClick={() => setIsRunning(false)}
            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Pause
          </button>

          <button
            onClick={() => {
              setTimeLeft(25 * 60);
              setIsRunning(false);
              stopCompletionSound();
              setShowPopUp(false);
            }}
            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-rose-500 hover:text-rose-500 dark:hover:text-rose-400"
          >
            Reset
          </button>
        </div>
      </div>

      {showPopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 animate-in">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full text-center transition-colors duration-300 transform scale-100">
            <h2 className="text-2xl font-black text-[#3b8ea0] dark:text-[#4eb7b3] uppercase tracking-wide">
              Session Complete!
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
              Great work maintaining your deep focus block. Go stretch and take a healthy break!
            </p>

            <button
              className="w-full py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl shadow-xs transition-colors mt-2 cursor-pointer"
              onClick={() => {
                finRef.current.pause();
                finRef.current.currentTime = 0;
                setShowPopUp(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;