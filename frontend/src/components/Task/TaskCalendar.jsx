import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TaskCalendar({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const totalDays = daysInMonth(month, year);
  const firstDay = firstDayOfMonth(month, year); // 0 (Sun) to 6 (Sat)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Create an array of days to render
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Empty slots for days before the 1st of the month
    // In JS, getDay() returns 0 for Sunday. If we want Monday to be first, we can adjust, but let's stick to Sun-Sat.
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [firstDay, totalDays]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        // Assume dueDate is YYYY-MM-DD
        const dateStr = task.dueDate.split('T')[0];
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const getDayTasks = (day) => {
    if (!day) return [];
    // format as YYYY-MM-DD with padding
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${year}-${m}-${d}`;
    return tasksByDate[dateStr] || [];
  };

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-soft p-6 animate-in delay-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-main">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 border border-soft rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            <ChevronLeft size={18} className="text-main" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 border border-soft rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            <ChevronRight size={18} className="text-main" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-muted mb-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, idx) => {
          const dayTasks = getDayTasks(day);
          
          return (
            <div 
              key={idx} 
              className={`
                min-h-[80px] p-2 border border-gray-100 rounded-xl relative transition-all duration-200
                ${!day ? 'bg-transparent border-transparent' : 'bg-white hover:border-(--primary) hover:shadow-sm'}
                ${isToday(day) ? 'ring-2 ring-(--primary) ring-opacity-50 bg-green-50/30' : ''}
              `}
            >
              {day && (
                <>
                  <span className={`text-sm font-medium ${isToday(day) ? 'text-(--primary)' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  
                  {/* Task Indicators */}
                  <div className="mt-1 space-y-1">
                    {dayTasks.slice(0, 2).map(task => (
                      <div 
                        key={task._id} 
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded-md text-white
                          ${task.status === "Completed" ? "bg-gray-400" : 
                            task.priority === "High" ? "bg-red-400" : 
                            task.priority === "Medium" ? "bg-yellow-400" : "bg-green-400"}
                        `}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[10px] font-medium text-gray-500 pl-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
