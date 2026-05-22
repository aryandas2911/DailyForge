import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const today = new Date();

  return (
    <div className="card p-4 shadow-sm w-64 border-soft flex-shrink-0 animate-in">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="text-muted hover:text-primary transition-colors cursor-pointer">
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-main text-sm">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button onClick={nextMonth} className="text-muted hover:text-primary transition-colors cursor-pointer">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {days.map((day) => (
          <span key={day} className="text-[10px] font-medium text-muted uppercase">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNumber = index + 1;
          const isToday =
            today.getDate() === dayNumber &&
            today.getMonth() === currentDate.getMonth() &&
            today.getFullYear() === currentDate.getFullYear();

          return (
            <div
              key={dayNumber}
              className={`text-xs p-1 rounded-md flex items-center justify-center h-7 w-7 mx-auto transition-colors ${
                isToday
                  ? "text-white font-bold shadow-sm"
                  : "text-main hover:opacity-80"
              }`}
              style={{
                backgroundColor: isToday ? "var(--primary)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isToday) e.currentTarget.style.backgroundColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                if (!isToday) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
}
