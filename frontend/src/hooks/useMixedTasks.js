import { useEffect, useState } from "react";

/**
 * Custom hook to handle updates for both DB-backed tasks and routine-generated tasks.
 * 
 * Routine tasks have synthetic IDs prefixed with "routine-" and are stored in localStorage only.
 * DB tasks have valid MongoDB ObjectIds and use the API.
 * 
 * @param {Function} updateDbTask API-backed task updater from useTasks
 * @returns {Object} { updateTask, routineTasks, setRoutineTasks }
 */
const useMixedTasks = (updateDbTask) => {
  const [routineTasks, setRoutineTasks] = useState(() => {
    const stored = localStorage.getItem("activeRoutineTasks");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const syncRoutineTasks = (event) => {
      if (event?.type === "activeRoutineTasksUpdated" && Array.isArray(event?.detail)) {
        setRoutineTasks(event.detail);
        return;
      }

      const stored = localStorage.getItem("activeRoutineTasks");
      setRoutineTasks(stored ? JSON.parse(stored) : []);
    };

    window.addEventListener("storage", syncRoutineTasks);
    window.addEventListener("activeRoutineTasksUpdated", syncRoutineTasks);

    return () => {
      window.removeEventListener("storage", syncRoutineTasks);
      window.removeEventListener("activeRoutineTasksUpdated", syncRoutineTasks);
    };
  }, []);

  /**
   * Smart update handler that detects task type and routes appropriately
   * @param {string} id - Task ID (either valid ObjectId or routine-*)
   * @param {Object} updates - Fields to update
   */
  const updateTask = async (id, updates) => {
    // Check if this is a routine task (synthetic ID with routine- prefix)
    if (id && String(id).startsWith("routine-")) {
      // Handle routine task locally
      let result;
      setRoutineTasks((prev) => {
        const updated = prev.map((task) =>
          task._id === id ? { ...task, ...updates } : task
        );
        // Persist to localStorage (wrap in try/catch for safety)
        try {
          localStorage.setItem("activeRoutineTasks", JSON.stringify(updated));
        } catch (error) {
          // ignore localStorage failures
          console.error("Failed to persist routine tasks to localStorage", error);
        }
        // Dispatch a dedicated custom event so same-tab listeners can subscribe
        try {
          window.dispatchEvent(
            new CustomEvent("activeRoutineTasksUpdated", { detail: updated })
          );
        } catch {
          // fallback to a generic event
          window.dispatchEvent(new Event("activeRoutineTasksUpdated"));
        }
        result = updated.find((t) => t._id === id);
        return updated;
      });
      // return the updated task for callers that await this
      return result;
    }

    if (typeof updateDbTask === "function") {
      // Handle DB-backed task via API
      await updateDbTask(id, updates);
    }
  };

  return { updateTask, routineTasks, setRoutineTasks };
};

export default useMixedTasks;
