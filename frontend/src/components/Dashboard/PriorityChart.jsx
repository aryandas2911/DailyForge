import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const priorityOrder = ["High", "Medium", "Low"];
const priorityColors = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#22c55e",
};

export default function PriorityChart({ tasks }) {
  const chartData = priorityOrder.map((priority) => ({
    priority,
    count: tasks.filter((task) => task.priority === priority).length,
  }));

  const totalTasks = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="card w-full">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold text-main">Task Distribution</h2>
          <p className="text-xs text-muted">
            Live priority breakdown of your current tasks
          </p>
        </div>
      </div>

      {totalTasks > 0 ? (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 12, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                wrapperStyle={{
                  borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, .08)",
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.priority} fill={priorityColors[entry.priority]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-muted text-center py-10">
          No tasks available yet. Add tasks to populate the chart.
        </p>
      )}
    </div>
  );
}
