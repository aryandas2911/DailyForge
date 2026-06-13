import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { CATEGORIES, getCategoryColor } from "../../utils/categoryUtils";

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  if (hours === 0) return `${remainder} min`;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
};

const formatHours = (minutes) => `${(minutes / 60).toFixed(1)}h`;

export default function TimeUsageChart({ tasks = [] }) {
  if (import.meta.env.DEV) {
    console.debug("TimeUsageChart tasks", tasks);
  }

  const { chartData, totalMinutes, totalCategories, mostUsedCategory } = useMemo(() => {
    const categoryTotals = {};
    let missingDurationCount = 0;

    tasks?.forEach((task) => {
      const duration = Number(task.duration);
      const effectiveDuration = duration > 0 ? duration : 30;
      if (duration <= 0) missingDurationCount += 1;

      const tags = Array.isArray(task.tags) && task.tags.length > 0 ? task.tags : ["Other"];
      const share = effectiveDuration / tags.length;

      tags.forEach((tag) => {
        const categoryName = CATEGORIES.some((cat) => cat.name === tag) ? tag : "Other";
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + share;
      });
    });

    const data = CATEGORIES.map((category) => ({
      name: category.name,
      value: Math.round((categoryTotals[category.name] || 0) * 100) / 100,
    })).filter((item) => item.value > 0);

    data.sort((a, b) => b.value - a.value);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const mostUsed = data.length ? data[0].name : "—";

    return {
      chartData: data,
      totalMinutes: total,
      totalCategories: data.length,
      mostUsedCategory: mostUsed,
      missingDurationCount,
    };
  }, [tasks]);

  const hasData = chartData.length > 0;

  return (
    <div className="card w-full p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-main">Time Usage Breakdown</h2>
          <p className="text-sm text-muted mt-1">
            Visualize how your planned task time is distributed across categories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="rounded-2xl border border-soft bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Total planned
            </p>
            <p className="mt-2 text-2xl font-semibold text-main">
              {hasData ? formatHours(totalMinutes) : "0h"}
            </p>
          </div>
          <div className="rounded-2xl border border-soft bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Most used category
            </p>
            <p className="mt-2 text-base font-semibold text-main">
              {mostUsedCategory}
            </p>
          </div>
          <div className="rounded-2xl border border-soft bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Total categories
            </p>
            <p className="mt-2 text-2xl font-semibold text-main">
              {totalCategories}
            </p>
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="mt-6 h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${Math.round(percent * 100)}%`
                }
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={getCategoryColor(entry.name).color}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${formatMinutes(value)}`, "Planned"]}
                contentStyle={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={64}
                iconType="circle"
                wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-soft bg-muted/10 p-8 text-center">
          <p className="text-sm text-muted">
            No duration-based task data is available yet. Add or update tasks with
            duration and categories to see your time usage breakdown.
          </p>
        </div>
      )}
    </div>
  );
}
