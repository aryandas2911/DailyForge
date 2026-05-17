import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/axios";

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  const getTasks = useCallback(async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks ?? []);
    } catch (error) {
      console.error(
        error?.response?.data?.message || "Failed to load tasks"
      );
    }
  }, []);

  const addTask = useCallback(
    async (taskData) => {
      await api.post("/tasks", taskData);
      await getTasks();
    },
    [getTasks]
  );

  const updateTask = useCallback(
    async (id, updates) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, ...updates } : t))
      );
      try {
        await api.put(`/tasks/${id}`, updates);
        await getTasks();
      } catch (error) {
        console.error(
          error?.response?.data?.message || "Failed to update task"
        );
        await getTasks();
      }
    },
    [getTasks]
  );

  const deleteTask = useCallback(
    async (id) => {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    },
    []
  );

  const bulkDelete = useCallback(
    async (ids) => {
      await api.post("/tasks/bulk-delete", { ids });
      await getTasks();
    },
    [getTasks]
  );

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  const value = useMemo(
    () => ({
      tasks,
      addTask,
      updateTask,
      deleteTask,
      bulkDelete,
      refetchTasks: getTasks,
    }),
    [tasks, addTask, updateTask, deleteTask, bulkDelete, getTasks]
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export default function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
