import React from 'react';
import LiveClock from './LiveClock';

const GreetingCard = ({ userName }) => {
  const getTimeDetails = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good morning",
        emoji: "🌅",
        message: "Rise and shine! A new day to conquer your goals."
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good afternoon",
        emoji: "☀️",
        message: "Keep going! You're doing great."
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greeting: "Good evening",
        emoji: "🌆",
        message: "Time to wind down and reflect on your day."
      };
    } else {
      return {
        greeting: "Good night",
        emoji: "🌙",
        message: "Rest well to fuel your tomorrow."
      };
    }
  };

  const { greeting, emoji, message } = getTimeDetails();

  return (
    <div className="animate-in flex flex-col md:flex-row justify-between items-start md:items-center p-8 shadow-lg rounded-2xl bg-white border border-(--border) relative overflow-hidden group transition-all duration-300 hover:shadow-xl">
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-(--primary) opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity" />
      
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-pulse-slow">{emoji}</span>
          <h1 className="text-3xl font-bold text-main tracking-tight">
            {greeting}, <span className="text-(--primary)">{userName || 'Forge User'}</span>
          </h1>
        </div>
        
        <p className="text-lg text-muted font-medium italic mt-1 opacity-90 max-w-md">
          "{message}"
        </p>
        
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-semibold text-muted/70 bg-(--bg)/50 px-4 py-2 rounded-full w-fit">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--primary) animate-pulse" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "2-digit",
              month: "short",
            }).replace(",", " ·")}
          </div>
          <span className="w-px h-4 bg-muted/20" />
          <div className="flex items-center gap-2">
            <LiveClock />
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative z-10">
        <div className="p-4 bg-(--bg) rounded-2xl border border-(--border) shadow-inner">
           <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Focus Mode</p>
              <p className="text-xs text-main font-medium">Ready to Forge?</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingCard;
