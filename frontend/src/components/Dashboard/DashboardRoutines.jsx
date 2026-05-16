import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import useRoutineStore from "../../store/routineStore";
import { useEffect } from "react";

export default function DashboardRoutines() {
  const navigate = useNavigate();
  const routines = useRoutineStore((state) => state.routines);
  const routinesLoading = useRoutineStore((state) => state.routinesLoading);
  const fetchRoutines = useRoutineStore((state) => state.fetchRoutines);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  return (
    <div className="card flex-1 animate-in delay-300 flex flex-col h-[340px] overflow-y-auto relative">
      {/* Header with button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-main">Saved Routines</h2>
        <button
          className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer flex items-center gap-1"
          onClick={() => navigate("/routine-builder")}
        >
          Build
          <ArrowRight size={16} />
        </button>
      </div>

      {routinesLoading ? (
        <p className="text-sm text-muted">Loading routines…</p>
      ) : routines.length === 0 ? (
        <p className="text-sm text-muted text-center mt-10">
          No routines saved yet
        </p>
      ) : (
        <ul className="space-y-3">
          {routines.map((routine) => {
            // Derived value: number of unique days
            const uniqueDays = new Set(routine.items.map((i) => i.day)).size;
            
            return (
              <li
                key={routine._id}
                className="border-l-4 border-primary rounded-xl p-4 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 animate-in"
              >
                <p className="font-medium text-main">{routine.name}</p>
                {routine.description && (
                  <p className="text-xs text-muted mt-0.5 line-clamp-2 italic">
                    {routine.description}
                  </p>
                )}
                <p className="text-[10px] text-muted/80 mt-1 uppercase tracking-wider">
                  {routine.items.length} tasks across {uniqueDays} day(s)
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
