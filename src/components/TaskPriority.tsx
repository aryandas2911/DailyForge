import React from 'react';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface TaskPriorityProps {
  priority: Priority;
  onChange?: (priority: Priority) => void;
  disabled?: boolean;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

export function TaskPriority({ priority, onChange, disabled }: TaskPriorityProps) {
  return (
    <select
      value={priority}
      onChange={(e) => onChange?.(e.target.value as Priority)}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${priorityColors[priority]}`}
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select>
  );
}
