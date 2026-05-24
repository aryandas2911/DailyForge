import { useEffect, useState } from "react";
import api from "../api/axios";

const useTasks = () => {
  const [tasks, setTasks] = useState([]);

  // fetch tasks from database
  const getTasks = async () => {
    try {
      const tasks = await api.get("/tasks");
      setTasks(tasks.data.tasks);
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to load tasks");
    }
  };

  // create new task
  const addTask = async (taskData) => {
    try {
      const response = await api.post("/tasks", taskData);
      console.log("Task added:", response.data);
      setTasks((prev) => [response.data.newTask, ...prev]);
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log(
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message
      );
      alert(
        error?.response?.data?.message ||
        "Failed to create task"
      );
    }
  };

  // update task
  const updateTask = async (id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...updates } : t))
    );
    try {
      await api.put(`/tasks/${id}`, updates);
      await getTasks();
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to update task");
      await getTasks();
    }
  };

  // delete task
  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  // bulk delete tasks
  const bulkDelete = async (ids) => {
    await api.post("/tasks/bulk-delete", { ids });
    getTasks();
  };

  // bulk edit tasks
  const bulkUpdate = async (ids, updates) => {
    await Promise.all(ids.map((id) => api.put(`/tasks/${id}`, updates)));
    await getTasks();
  };

  // archive task
  const archiveTask = async (id) => {
    await api.put(`/tasks/${id}`, { isArchived: true });
    getTasks();
  };

  // unarchive task
  const unarchiveTask = async (id) => {
    await api.put(`/tasks/${id}`, { isArchived: false });
    getTasks();
  };

  // initial fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTasks();
  }, []);

  return {
    tasks,
    activeTasks: tasks.filter((t) => !t.isArchived),
    archivedTasks: tasks.filter((t) => t.isArchived),
    addTask,
    updateTask,
    deleteTask,
    bulkDelete,
    bulkUpdate,
    archiveTask,
    unarchiveTask,
  };
};

export default useTasks;