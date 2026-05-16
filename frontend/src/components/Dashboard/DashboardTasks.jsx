import { useNavigate } from "react-router-dom";
import useTasks from "../../hooks/useTasks";

export default function DashboardTasks() {
  const { tasks, updateTask } = useTasks();
  const navigate = useNavigate();

  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const priorityBorder = {
    Low: "border-green-400",
    Medium: "border-yellow-400",
    High: "border-red-500",
  };

  const priorityBadge = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  const todayTasks = tasks
    ?.filter((task) => {
      const today = new Date();
      const created = new Date(task.createdAt);

      return (
        today.getFullYear() === created.getFullYear() &&
        today.getMonth() === created.getMonth() &&
        today.getDate() === created.getDate()
      );
    })
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 5);

  return (
    <div className="card w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold text-main">Today’s Focus</h2>
          <p className="text-xs text-muted">Top priorities for today</p>
        </div>

        <button
          className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer"
          onClick={() => navigate("/tasks")}
        >
          Manage →
        </button>
      </div>

      {todayTasks?.length ? (
        <div className="space-y-3">
          {todayTasks.map((task) => (
            <div
              key={task._id}
              className={`group relative flex items-center gap-4 border-l-4 rounded-xl p-4 transition-all duration-200
              ${priorityBorder[task.priority]}
              bg-white/80 hover:bg-white shadow-sm hover:shadow-md`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                className="h-4 w-4 accent-(--primary) cursor-pointer"
                checked={task.status === "Completed"}
                onChange={() =>
                  updateTask(task._id, {
                    status: task.status === "Completed" ? "Due" : "Completed",
                  })
                }
              />

              {/* Task content */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-colors ${
                    task.status === "Completed"
                      ? "line-through text-muted"
                      : "text-main"
                  }`}
                >
                  {task.title}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      priorityBadge[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>

                  {task.status === "Completed" && (
                    <span className="text-[11px] text-muted">Completed</span>
                  )}
                </div>
              </div>

              {/* Hover affordance */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted opacity-0 group-hover:opacity-100 transition">
                ✓
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted text-center py-6">
          No tasks for today.
          <span
            className="block mt-2 text-primary hover:underline cursor-pointer"
            onClick={() => navigate("/tasks")}
          >
            Add your first task →
          </span>
        </div>
      )}
    </div>
  );
}
