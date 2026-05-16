import useTaskStore from "../../store/taskStore";

export default function StatCard({ type, label, icon }) {
  const tasks = useTaskStore((state) => state.tasks);

  const getStats = () => {
    const today = new Date();

    if (type === "today") {
      const todayTasks = tasks.filter((task) => {
        const created = new Date(task.createdAt);
        return (
          today.getFullYear() === created.getFullYear() &&
          today.getMonth() === created.getMonth() &&
          today.getDate() === created.getDate()
        );
      });

      const completed = todayTasks.filter((t) => t.status === "Completed").length;
      return {
        value: `${completed} / ${todayTasks.length}`,
        subtitle: "Tasks done"
      };
    }

    if (type === "week") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const weekTasks = tasks.filter((task) => {
        const created = new Date(task.createdAt);
        return created >= startOfWeek && created <= endOfWeek;
      });

      const completedCount = weekTasks.filter((t) => t.status === "Completed").length;
      const percent = weekTasks.length ? Math.round((completedCount / weekTasks.length) * 100) : 0;
      
      return {
        value: `${percent}%`,
        subtitle: "Completion"
      };
    }

    return { value: "0", subtitle: "" };
  };

  const { value, subtitle } = getStats();

  return (
    <div className="card flex items-start gap-4">
      <div className="text-primary">{icon}</div>

      <div>
        <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-main">{value}</p>
        {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
