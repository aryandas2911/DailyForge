/**
 * SkeletonLoader - Reusable shimmer/pulse skeleton UI for Dashboard sections.
 * Prevents layout shifts and improves perceived performance while data loads.
 */

// Base skeleton block with pulse animation
const SkeletonBlock = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 ${className}`}
  />
);

// Skeleton for StatCard components
export const StatCardSkeleton = () => (
  <div className="card flex flex-col gap-3 p-5">
    <div className="flex items-center justify-between">
      <SkeletonBlock className="h-4 w-20" />
      <SkeletonBlock className="h-9 w-9 rounded-xl" />
    </div>
    <SkeletonBlock className="h-8 w-16 rounded-lg" />
    <SkeletonBlock className="h-3 w-28 rounded-md" />
  </div>
);

// Skeleton for upcoming task preview items
export const TaskPreviewSkeleton = () => (
  <div className="card flex flex-col gap-3 p-5">
    <SkeletonBlock className="mb-2 h-5 w-36 rounded-md" />
    {[1, 2].map((i) => (
      <div
        key={i}
        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-800/60"
      >
        <SkeletonBlock className="h-10 w-10 flex-shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonBlock className="h-4 w-3/4 rounded-md" />
          <SkeletonBlock className="h-3 w-1/2 rounded-md" />
        </div>
        <SkeletonBlock className="h-6 w-16 flex-shrink-0 rounded-full" />
      </div>
    ))}
  </div>
);

// Skeleton for the contribution heatmap grid
export const HeatmapSkeleton = () => (
  <div className="card p-5">
    <SkeletonBlock className="mb-4 h-5 w-48 rounded-md" />
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {Array.from({ length: 53 }).map((_, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, rowIdx) => (
              <SkeletonBlock key={rowIdx} className="h-3 w-3 rounded-sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton for saved routine list items
export const RoutineListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="border-l-4 border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-white/80 dark:bg-slate-800/80 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <SkeletonBlock className="h-4 w-36 rounded-md" />
          <SkeletonBlock className="h-7 w-7 rounded-lg flex-shrink-0" />
        </div>
        <SkeletonBlock className="h-3 w-24 rounded-md" />
      </div>
    ))}
  </div>
);

// Skeleton for the DashboardTasks section
export const DashboardTasksSkeleton = () => (
  <div className="card p-5">
    <SkeletonBlock className="mb-4 h-5 w-32 rounded-md" />
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-800/60"
        >
          <SkeletonBlock className="h-5 w-5 flex-shrink-0 rounded" />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonBlock className="h-4 w-2/3 rounded-md" />
            <SkeletonBlock className="h-3 w-1/3 rounded-md" />
          </div>
          <SkeletonBlock className="h-7 w-20 flex-shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonBlock;
