import React from "react";

const TaskSuggestions = ({ mood, tasks }) => {

  let filteredTasks = [];

  switch (mood) {

    case "Tired":
      filteredTasks = tasks.filter(
        (task) => task.difficulty === "easy"
      );
      break;

    case "Motivated":
      filteredTasks = tasks.filter(
        (task) => task.priority === "high"
      );
      break;

    case "Overwhelmed":
      filteredTasks = tasks.slice(0, 2);
      break;

    default:
      filteredTasks = tasks;
  }

  return (
    <div className="mt-8">

      <h2 className="text-2xl font-bold mb-4 text-white">
        Suggested Tasks
      </h2>

      <div className="grid gap-4">

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-zinc-800 p-4 rounded-xl border border-zinc-700"
          >

            <h3 className="text-lg font-semibold text-white">
              {task.title}
            </h3>

            <div className="flex gap-3 mt-2">

              <span className="text-sm px-3 py-1 rounded-full bg-zinc-700 text-zinc-300">
                {task.difficulty}
              </span>

              <span className="text-sm px-3 py-1 rounded-full bg-zinc-700 text-zinc-300">
                {task.priority}
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default TaskSuggestions;