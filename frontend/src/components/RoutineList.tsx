import React, { useState } from 'react';

export interface RoutineItem {
  id: string;
  _id?: string;
  name: string;
  day?: string;
  duration?: number;
  orderIndex?: number;
}

export interface RoutineListProps {
  routineId?: string;
  initialItems: RoutineItem[];
  onReorder?: (items: RoutineItem[]) => void;
}

export const RoutineList: React.FC<RoutineListProps> = ({
  routineId,
  initialItems,
  onReorder,
}) => {
  const [items, setItems] = useState<RoutineItem[]>(initialItems || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    // Reassign orderIndex
    const reordered = newItems.map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));

    setItems(reordered);
    setDraggedIndex(index);

    if (onReorder) {
      onReorder(reordered);
    }
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      await fetch('/api/routines/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineId,
          items: items.map((item, idx) => ({
            id: item.id || item._id,
            orderIndex: idx,
          })),
        }),
      });
    } catch (err) {
      console.error('Failed to sync reordered routine items:', err);
    }
  };

  return (
    <ul className="routine-list space-y-2">
      {items.map((item, index) => (
        <li
          key={item.id || item._id || index}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`p-3 bg-card border border-border rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-between transition-transform ${
            draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground select-none">
              ≡ #{index + 1}
            </span>
            <span className="font-semibold text-foreground">{item.name}</span>
          </div>
          {item.day && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-medium">
              {item.day}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default RoutineList;
