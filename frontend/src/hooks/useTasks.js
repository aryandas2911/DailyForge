import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const useTasks = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);

  // fetch tasks from database
  const getTasks = async () => {
    try {
      const tasks = await api.get("/tasks");
      setTasks(tasks.data.tasks);
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to load tasks", "error");
    }
  };

  // create new task
  const addTask = async (taskData) => {
    try {
      const response = await api.post("/tasks", taskData);
      setTasks((prev) => [response.data.newTask, ...prev]);
      showToast("Task created successfully");
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to create task", "error");
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
      showToast("Task updated successfully");
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to update task", "error");
      await getTasks();
    }
  };

  // delete task
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      showToast("Task deleted successfully");
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to delete task", "error");
    }
  };

  // initial fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTasks();
  }, []);

  // bulk delete tasks
  const bulkDelete = async (ids) => {
    try {
      await api.post("/tasks/bulk-delete", { ids });
      await getTasks();
      showToast(`${ids.length} task(s) deleted successfully`);
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to delete tasks", "error");
    }
  };

  // bulk edit tasks
  const bulkUpdate = async (ids, updates) => {
    try {
      await Promise.all(ids.map((id) => api.put(`/tasks/${id}`, updates)));
      await getTasks();
      showToast(`${ids.length} task(s) updated successfully`);
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to update tasks", "error");
    }
  };

  // return reusable functions
  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    bulkDelete,
    bulkUpdate,
  };
};

export default useTasks;
