import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Copy, GripVertical } from 'lucide-react';
import api from '../../api/axios';

export default function RoutineList({ 
  routines, 
  setRoutines, 
  onNavigate, 
  onDuplicate, 
  isGrid = false,
  fetchRoutines,
  renderItem
}) {
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;

    const newRoutines = Array.from(routines);
    const [reorderedItem] = newRoutines.splice(sourceIndex, 1);
    newRoutines.splice(destinationIndex, 0, reorderedItem);

    // Update local state immediately for snappy UI
    setRoutines(newRoutines);

    // Prepare API payload
    const routineIds = newRoutines.map(r => r._id);
    
    try {
      await api.put('/routines/reorder', { routineIds });
      if (fetchRoutines) {
        await fetchRoutines();
      }
    } catch (error) {
      console.error('Failed to reorder routines:', error);
      // Revert if API fails
      if (fetchRoutines) {
        await fetchRoutines();
      }
    }
  };

  if (!routines || routines.length === 0) {
    return (
      <p className="text-sm text-muted text-center mt-10">
        No routines saved yet
      </p>
    );
  }

  const containerClass = isGrid 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
    : "space-y-3";

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="routines-list" direction={isGrid ? "horizontal" : "vertical"}>
        {(provided) => (
          <ul 
            className={containerClass}
            {...provided.droppableProps} 
            ref={provided.innerRef}
          >
            {routines.map((routine, index) => (
              <Draggable key={routine._id} draggableId={routine._id} index={index}>
                {(provided, snapshot) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                      ${isGrid ? "" : "border-l-4 border-primary"}
                      rounded-xl bg-white/80 dark:bg-slate-800/80 
                      shadow-sm hover:shadow-md transition-all duration-200 
                      ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/50' : 'hover-lift hover:bg-white dark:hover:bg-slate-800'}
                    `}
                    style={{
                      ...provided.draggableProps.style,
                      ...(isGrid && !snapshot.isDragging ? { transform: 'none' } : {})
                    }}
                  >
                    {renderItem ? (
                      <div className="relative group">
                        <div 
                          {...provided.dragHandleProps} 
                          className="absolute top-2 right-2 p-1.5 text-muted hover:text-main cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 rounded-md shadow-sm"
                        >
                          <GripVertical size={16} />
                        </div>
                        {renderItem(routine)}
                      </div>
                    ) : (
                      <div 
                        className={`flex ${isGrid ? "flex-col p-5" : "items-start justify-between gap-3 p-4"} cursor-pointer`}
                        onClick={() => onNavigate ? onNavigate(routine) : null}
                      >
                        <div className={`flex items-start ${isGrid ? "justify-between w-full mb-3" : "gap-3"}`}>
                          <div className="flex items-center gap-2">
                            <div 
                              {...provided.dragHandleProps} 
                              className="text-muted hover:text-main cursor-grab active:cursor-grabbing p-1 -ml-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical size={16} />
                            </div>
                            <p className="font-medium text-main">{routine.name}</p>
                          </div>
                          {onDuplicate && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(routine);
                              }}
                              aria-label={`Duplicate ${routine.name}`}
                              title="Duplicate routine"
                              className="shrink-0 rounded-lg p-2 text-muted hover:text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                              <Copy size={16} />
                            </button>
                          )}
                        </div>
                        
                        <div className={isGrid ? "flex flex-col gap-2" : ""}>
                          {routine.description && (
                            <p className={`text-xs text-muted ${isGrid ? "" : "mt-0.5 line-clamp-2"} italic`}>
                              {routine.description}
                            </p>
                          )}
                          <p className={`text-[10px] text-muted/80 ${isGrid ? "mt-2" : "mt-1"} uppercase tracking-wider`}>
                            {routine.items?.length || 0} tasks across{" "}
                            {new Set((routine.items || []).map((i) => i.day)).size} day(s)
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
