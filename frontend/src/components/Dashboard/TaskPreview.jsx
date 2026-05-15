import { useNavigate } from "react-router-dom";


export default function TaskPreview({ tasks , updateTask}) {
  const navigate = useNavigate();

  
const handleExport = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/routines/export",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "routines.ics";

    document.body.appendChild(a);

    a.click();

    a.remove();
  } catch (error) {
    console.log("Export failed", error);
  }
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

  return (
    <div className="bg-(--surface) rounded-2xl shadow-lg p-6 border border-white/10">
      <h2 className="text-lg font-semibold text-main mb-4">Upcoming Tasks</h2>

      {tasks?.length ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`flex items-center gap-4 border-l-4 rounded-xl p-4 transition
              ${priorityBorder[task.priority]}
              bg-white/80 hover:bg-white shadow-sm`}
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

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    task.status === "Completed"
                      ? "line-through decoration-2 decoration-muted text-muted"
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

                  {task.dueDate && (
                    <span className="text-[11px] text-muted">
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted text-center py-6">
          No upcoming tasks.
        </p>
      )}

      <div className="mt-4 text-sm text-primary">
        <button
          onClick={() => navigate("/tasks")}
          className="hover:underline cursor-pointer"
        >
          View All Tasks →
        </button>
      </div>

<div className="mt-4 flex flex-col sm:flex-row items-center gap-3 text-sm">
  <button
    onClick={() => navigate("/tasks")}
    className="text-primary hover:underline cursor-pointer"
  >
    View All Tasks →
  </button>

  <button
    onClick={handleExport}
    className="
      px-5 py-2 rounded-xl
      bg-blue-500 text-white
      hover:bg-blue-600
      shadow-md hover:shadow-lg
      transition-all duration-200
      cursor-pointer
      flex items-center gap-2
    "
  >
    <span>Export Calendar</span>
    <span>📅</span>
  </button>
</div>


    </div>
  );
}
