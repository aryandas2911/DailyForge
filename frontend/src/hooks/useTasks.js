import { useEffect, useState } from "react";
import api from "../api/axios";

const UNDO_DELAY_MS = 5000;

const useTasks = () => {
  const [tasks, setTasks] = useState([]);

  const getTasks = async () => {
    try {
      const tasks = await api.get("/tasks");
      setTasks(tasks.data.tasks);
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to load tasks");
    }
  };

  const addTask = async (taskData) => {
    await api.post("/tasks", taskData);
    getTasks();
  };

  const updateTask = async (id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...updates } : t)),
    );
    try {
      await api.put(`/tasks/${id}`, updates);
      await getTasks();
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to update task");
      await getTasks();
    }
  };

  const deleteTask = async (id) => {
    const removed = tasks.find((t) => t._id === id);
    if (!removed) {
      return null;
    }

    setTasks((prev) => prev.filter((t) => t._id !== id));

    let committed = false;
    const timerId = window.setTimeout(async () => {
      committed = true;
      try {
        await api.delete(`/tasks/${id}`);
      } catch (error) {
        console.log(error?.response?.data?.message || "Failed to delete task");
        setTasks((prev) => {
          if (prev.some((t) => t._id === id)) {
            return prev;
          }
          return [...prev, removed];
        });
      }
    }, UNDO_DELAY_MS);

    return () => {
      if (committed) {
        return false;
      }
      window.clearTimeout(timerId);
      setTasks((prev) => {
        if (prev.some((t) => t._id === id)) {
          return prev;
        }
        return [...prev, removed];
      });
      return true;
    };
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTasks();
  }, []);

  const bulkDelete = async (ids) => {
    await api.post("/tasks/bulk-delete", { ids });
    getTasks();
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    bulkDelete,
  };
};

export default useTasks;
