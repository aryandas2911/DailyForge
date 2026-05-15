import React from "react";

const RoutineItem = ({ routine }) => {
  const uniqueDays = new Set(routine.items.map((i) => i.day)).size;

  return (
    <li className="border border-soft rounded-lg p-2 bg-white/80 shadow-sm hover-lift animate-in">
      <p className="font-medium text-main">{routine.name}</p>
      <p className="text-xs text-muted">
        {routine.items.length} tasks across {uniqueDays} day(s)
      </p>
    </li>
  );
};

export default RoutineItem;
