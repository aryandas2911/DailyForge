import { Flame } from "lucide-react";

export default function StreakCard({ streak }) {
  return (
    <div className="bg-white/80 rounded-xl shadow-md p-5 hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted font-medium">
            Current Streak
          </p>

          <h2 className="text-3xl font-bold text-orange-500 mt-2">
            {streak} Days
          </h2>

          <p className="text-sm text-muted mt-1">
            Stay consistent daily
          </p>
        </div>

        <div className="bg-orange-100 p-3 rounded-full">
          <Flame className="text-orange-500" size={28} />
        </div>
      </div>
    </div>
  );
}