import React from 'react';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface TaskPriorityProps {
  priority: Priority;
  onChange?: (priority: Priority) => void;
  disabled?: boolean;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700 dark:text-slate-100',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function TaskPriority({ priority, onChange, disabled }: TaskPriorityProps) {
  return (
    <select
      value={priority}
      onChange={(e) => onChange?.(e.target.value as Priority)}
      disabled={disabled}
      className={px-2 py-1 rounded-full text-xs font-medium }
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select>
  );
}
